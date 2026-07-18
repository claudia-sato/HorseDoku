from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import joinedload
from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

app = Flask(__name__)
app.config.from_object(Config)

db = SQLAlchemy()

CORS(app)

db.init_app(app)

horse_races = db.Table('horse_raced',
    db.Column('horse_id', db.Integer, db.ForeignKey('horses.horse_id'), primary_key=True),
    db.Column('race_id', db.Integer, db.ForeignKey('races.race_id'), primary_key=True),
    db.Column('position', db.Integer)
)

class Races(db.Model):
    __tablename__ = 'races'

    race_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    race_name = db.Column(db.String(80), unique=True)
    distance = db.Column(db.Integer)
    ground = db.Column(db.String(4))

    def to_dict(self):
        return {
            'race_id': self.race_id,
            'race_name': self.race_name,
            'distance': self.distance,
            'ground': self.ground
        }

class Horses(db.Model):
    __tablename__ = 'horses'

    horse_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    horse_name = db.Column(db.String(80))
    horse_birth = db.Column(db.Date)
    colors = db.Column(db.String(80))
    G1_wins = db.Column(db.Integer)
    img_path = db.Column(db.String(200))

    races = db.relationship('Races', secondary=horse_races, backref=db.backref('horses', lazy='dynamic'))

    def to_dict(self):
        return {
            'horse_id': self.horse_id,
            'horse_name': self.horse_name,
            'horse_birth': self.horse_birth.isoformat() if self.horse_birth else None,
            'colors': self.colors,
            'G1_wins': self.G1_wins,
            'img_path': self.img_path
        }


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/debug/horses', methods=['GET'])
def debug_horses():
    horses = Horses.query.all()
    return jsonify({
        'count': len(horses),
        'horses': [{'horse_id': h.horse_id, 'horse_name': h.horse_name} for h in horses]
    })
    
@app.route('/api/horses', methods=['GET'])
def get_horses():
    horses = Horses.query.all()

    output = []
    for horse in horses:
        horse_data = {'name': horse.horse_name, 'birth': horse.horse_birth.isoformat() if horse.horse_birth else None, 'colors': horse.colors, 'G1_wins': horse.G1_wins, 'img_path': horse.img_path}

        output.append(horse_data)

    return {"horses": output}

@app.route('/api/horses/<int:horse_id>', methods=['GET'])
def get_horse(horse_id):
    horse = Horses.query.get_or_404(horse_id)

    return jsonify(horse.to_dict())

@app.route('/api/horses/full-data', methods=['GET'])
def get_horses_full_data():
    horses = Horses.query.options(joinedload(Horses.races)).all()

    output = []
    for horse in horses:
        horse_data = {
            'horse_id': horse.horse_id,
            'horse_name': horse.horse_name,
            'horse_birth': horse.horse_birth.isoformat() if horse.horse_birth else None,
            'colors': horse.colors,
            'G1_wins': horse.G1_wins,
            'img_path': horse.img_path,
            'races': [{'race_id': race.race_id, 'race_name': race.race_name, 'race_distance': race.distance, 'race_ground': race.ground} for race in horse.races]
        }
        output.append(horse_data)
        
    return jsonify({'horses': output})

@app.route('/api/horses/search', methods=['GET'])
def search_horse():
        birth_year_filter = request.args.get('birth')
        color_filter = request.args.get('color')
        G1_wins_filter = request.args.get('G1_wins', type=int)
        race_distance = request.args.get('race_distance') 
        race_name_filter = request.args.get('race_name') 
        race_ground_filter = request.args.get('race_ground')
        race_ids = request.args.get('race_ids')

        query = Horses.query

        # Apply filter if provided

        if birth_year_filter:
            query = query.filter(Horses.horse_birth.ilike(f'%{birth_year_filter}%'))
        
        if color_filter:
            query = query.filter(Horses.colors.ilike(f'%{color_filter}%'))

        if G1_wins_filter:
            query = query.filter(Horses.G1_wins >= G1_wins_filter)

        race_distance_min = None
        race_distance_max = None

        if race_distance:
            distance_range = get_distance_range(race_distance)
            if distance_range and distance_range[0] is not None:
                race_distance_min = distance_range[0]
                race_distance_max = distance_range[1]
            query = query.filter(Races.distance.between(race_distance_min, race_distance_max))
        
        if race_name_filter or race_distance_min or race_distance_max or race_ground_filter:
            query = query.join(Horses.races)
            
            if race_name_filter:
                query = query.filter(Races.race_name.ilike(f'%{race_name_filter}%'))
            
            if race_ground_filter:
                query = query.filter(Races.ground.ilike(f'%{race_ground_filter}%'))

            if race_ids:
                # Parse comma-separated race IDs
                race_id_list = [int(id.strip()) for id in race_ids.split(',') if id.strip().isdigit()]
                if race_id_list:
                    query = query.filter(Races.race_id.in_(race_id_list))
        
        query = query.distinct()
        
        horses = query.all()

        output = []
        for horse in horses:
            horse_data = {
                'horse_id': horse.horse_id,
                'horse_name': horse.horse_name
            }
            output.append(horse_data)
            
        return jsonify({'horses': output})

def get_distance_range(distance_category):
    """Convert distance category string to min and max distance"""
    distance_map = {
        'sprint': (1000, 1300),
        'mile': (1301, 1899),
        'intermediate': (1900, 2100),
        'long': (2101, 2700),
        'extended': (2700, float('inf'))
    }
    return distance_map.get(distance_category, (None, None))

