class PopUp {
  constructor() {
    this.triggerDivs = document.querySelectorAll('.clickable-cell');
    this.popupOverlay = document.getElementById('popup-overlay');
    this.closeBtn = document.getElementById('close-btn');
    this.endOverlay = document.getElementById('end-overlay');
    this.searchInput = document.getElementById('searchInput');
    this.selectedCell = null;
    this.cellIndex = null;
    this.handlers = new Map();
  }

    showPopup() {
    const handlerClick = (cell, index) => {
        return () => {
            this.selectedCell = cell;
            this.cellIndex = index;
            this.popupOverlay.classList.remove('hidden');
        };
    };

        this.triggerDivs.forEach((cell, index) => {
            const handler = handlerClick(cell, index);
            this.handlers.set(cell, handler);
            cell.addEventListener('click', handler);
        });

        this.closeBtn.addEventListener('click', () => {
            this.popupOverlay.classList.add('hidden');
            this.searchInput.value = '';
        });

        this.popupOverlay.addEventListener('click', (event) => {
            if (event.target === this.popupOverlay) {
                this.popupOverlay.classList.add('hidden');
                this.searchInput.value = '';
            }
        });
    }

    removePopUp(cell){
        const handler = this.handlers.get(cell);
        if (handler) {
            cell.removeEventListener('click', handler);
            this.handlers.delete(cell);
        };
    }

    removeAllPopUp(){
        this.triggerDivs.forEach(cell =>{
            const handler = this.handlers.get(cell);
            cell.removeEventListener('click', handler);
            cell.classList.add('filled');
            cell.classList.remove('clickable-cell')
            this.handlers.delete(cell);
        });
    }

    showEndPopUp(){
        this.endOverlay.classList.remove('hidden');

        this.endOverlay.addEventListener('click', (event) =>{
            if (event.target === this.endOverlay){
                this.endOverlay.classList.add('hidden')
            }
        })
    }
}
window.PopUp = PopUp;