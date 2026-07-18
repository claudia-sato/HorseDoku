HorseDoku is a experimental project on API's displayed in a web application game

To be able to experience the game 

1. you must copy the db-script to MySQL WorkBench

2. run on the terminal the following:
cd yourDirectory\Horsedoku\api

python -m venv .venv

.venv\Scripts\activate

pip install -r requirements.txt

SET FLASK_APP=application.py
SET FLASK_ENV=development

run flask

3. open index.html
   
######
.env has default variables for the database if you wish to change the values are:
DATABASE_URL=mysql+pymysql://user:password@ip:port/dbName
SECRET_KEY=any_password
FLASK_ENV=development
