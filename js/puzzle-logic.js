class PuzzleLogic{
    constructor(){
        this.popup = new PopUp();
        this.api = new ApiService();
        this.cell = document.querySelectorAll('.cell');
        this.labels = ['', 'long', 'dirt', 'sprint', '', 'over-2 G1-wins', '', 'red', '', 'born 1990&#39;s', 'tries 0-/-9'];
        this.answers = [];
    }

    placeLabel(){
        this.cell.forEach((element, index) => {
            const labelText = this.labels[index % this.labels.length];

            if (labelText !== ''){
                const card = this.outerGridLabel(labelText);
                element.appendChild(card)
            }
        });

    }

    outerGridLabel(label){
        const card = document.createElement('div');
        card.className = 'label-outside';

        const words = label.split(' ');
        card.innerHTML = `
            <div class="label">
                ${words.map(word => `<h2>${word.replace(/-/g, ' ')}</h2>`).join('')}
            </div>
    `;
        return card;
    }

    selectAnswer(horse){
        const selectedCell = this.popup.selectedCell;
        
        this.checkAnswer(horse, selectedCell);

        this.selectedCell = null;       
    }

    async checkAnswer(horse, cell){
        const position = this.getPosition(cell);

        const labelRow = this.labels[position[0]];
        const labelColumn = this.labels[position[1]];

        const rowQuery = this.readLabel(labelRow);
        const columnQuery = this.readLabel(labelColumn);
        const query = Object.assign({}, rowQuery, columnQuery);

        const possibleAnsw = await this.api.advancedSearch(query);

        const answer = horse.horse_id;

        if (possibleAnsw.horses.some(h => h.horse_id === answer) && !this.answers.find(h => h === answer)) {
            this.placeImage(horse, cell);
            this.updateTries();
            this.answers.push(answer);
        }else {
            this.updateTries();
        }
    }

    getPosition(cell){
        const index = this.popup.cellIndex;

        let innerRow = Math.floor(index / 3);
        let innerColumn = index % 3;
 
        let rowIndex = innerRow + 5;
        let columnIndex = innerColumn + 1;

        switch (innerRow){
            case 0:
                rowIndex = innerRow + 5;
                break;
            case 1:
                rowIndex = innerRow + 6;
                break;
            case 2:
                rowIndex = innerRow + 7;
                break;
        }

        const position = [rowIndex, columnIndex];

        return position;
    }

    readLabel(label){
        const labelStr = String(label);
        const colors = ['red', 'yellow', 'blue', 'purple', 'green', 'cyan', 'orange', 'white'];
        const distance = ['sprint', 'mile', 'intermediate', 'long', 'extended'];
        const wins = 'over';
        const ground = ['turf', 'dirt'];
        const age = 'born';
        let query = {}

        if (colors.includes(label)){
            query = {color: label}
        } else if (distance.includes(label)){
            query = {race_distance: label}
        }else if (labelStr.includes(wins)){
            label = parseInt(label.replace(/-/g, ' ').split(' ')[1], 10)
            query = {G1_wins: label}
        }else if (ground.includes(label)){
            query = {race_ground: label}
        }else if (labelStr.includes(age)){
            label = (label.replace(/&#39;/g, ' ').split(' ')[1]).slice(0,-1);
            query = {birth: label}
        }
        
        return query;
    }


    placeImage(horse, cell){
        const imgSrc = horse.img_path || '';
        const imgContent = imgSrc 
            ? `<img src="${imgSrc}" alt="${horse.horse_name}" class="horse-cell-img">`
            : `<div class="horse-cell-img">🐎</div>`;

        const card = document.createElement('div');
        card.className = 'img-cell'

        card.innerHTML = `
            ${imgContent}
        `;

        cell.style.cursor = 'default';
        cell.classList.add('filled');
        cell.classList.add('answer-cell');
        cell.classList.remove('clickable-cell');
        this.popup.removePopUp(cell);

        cell.appendChild(card);
    }

    updateTries() {
        const current = this.labels[10];
        const match = current.match(/tries (\d+)-\/-(\d+)/);
            
        if (match) {
            let attempts = parseInt(match[1]);
            const total = parseInt(match[2]); 
                
            attempts++; 
                
            this.labels[10] = `tries ${attempts}-/-${total}`;

            const cellIndex = 10 % this.cell.length;
            const cell = this.cell[cellIndex];
                
            cell.innerHTML = '';
            const card = this.outerGridLabel(this.labels[10]);
            cell.appendChild(card);

            if (attempts === 9){
                this.endGame();
            }
        }
    }

    showInfo(){
        const triggerDivs = document.querySelectorAll('.clickable-cell');
        triggerDivs.forEach(cell => {
            cell.addEventListener('click', (e) =>{
                document.querySelector(".info-stack").remove();
                this.infoPopUp();
            });
        })
    }

    infoPopUp(){
        const selectedCell = this.popup.selectedCell;
        const position = this.getPosition(selectedCell);
        this.readLabel(selectedCell);

        const labelRow = (this.labels[position[0]]).replace(/-/g, ' ')
        const labelColumn = (this.labels[position[1]]).replace(/-/g, ' ')

        const info = document.createElement('div');
        info.className = 'info-stack'
        info.innerHTML = `
        <span class="info">
            <span aria-label="Row axis" class="info-dot hidden"></span>
            <span>${labelRow}</span>
          </span>
          <span class="info">
            <span style="margin-right: 4px; margin-left: 4px;">/</span>
            <span>${labelColumn}</span>
            <span aria-label="Row axis" class="info-dot-r hidden"></span>
          </span>
        `
        
        const infoPopup = document.querySelector('.info-popup');
        infoPopup.appendChild(info);
    }

    endGame(){
        const answerCells = document.querySelectorAll('.answer-cell')
        let points = 0;

        answerCells.forEach(cell =>{
            points++;
        })

        const score = document.createElement('div');
        score.className = 'score'
        score.innerHTML = `
            <h1>GAME OVER!</h1>
            <h3>your score: ${points}</h3>
            <button id="end-btn" onclick="location.reload()">Try again</button>
        `;

        const endPopup = document.querySelector('.end-popup');
        endPopup.appendChild(score);

        this.popup.removeAllPopUp();
        this.popup.showEndPopUp();
    }
}