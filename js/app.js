class HorseRacingApp {
    constructor() {
        this.api = new ApiService();
        this.searchEngine = new SearchEngine();
        this.puzzleLogic = new PuzzleLogic();
        this.currentResults = [];
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadInitialData();
    }

    initializeElements() {
        this.searchInput = document.getElementById('searchInput');
        this.horsesGrid = document.getElementById('horsesGrid');
        this.totalHorses = document.getElementById('totalHorses');
    }

    attachEventListeners() {
        // Main search input with debounce
        this.searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            if (searchTerm === ''){
                this.renderNothing();
                return;
            }
            this.searchEngine.debounceSearch(
                (results) => this.handleSearchResults(results),
                e.target.value
            );
        });

        this.puzzleLogic.popup.showPopup();
        this.puzzleLogic.showInfo();

    }

    async loadInitialData() {
        try {
            const horses = await this.searchEngine.fetchAllHorses();
            this.renderNothing();
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
        this.puzzleLogic.placeLabel();
    }

    handleSearchResults(results) {
        this.renderHorses(results);
    }

    applyFilters() {
        const criteria = {
            name: this.searchInput.value
        };

        // Only apply filters if at least one is filled
        if (Object.values(criteria).some(val => val)) {
            const results = this.searchEngine.advancedSearch(criteria);
            this.renderHorses(results);
        } else {
            // If no filters, show none
            this.renderNothing();
        }
    }

    renderHorses(horses) {
        this.horsesGrid.innerHTML = '';
        
        if (horses.length === 0) {
            this.horsesGrid.style.display = 'none';
            return;
        }

        this.horsesGrid.style.display = 'grid';

        horses.forEach(horse => {
            const card = this.createHorseCard(horse);
            this.horsesGrid.appendChild(card);
        });
    }

    renderNothing() {
        this.horsesGrid.innerHTML = '';
        this.horsesGrid.style.display = 'none';
    }


    createHorseCard(horse) {
        const card = document.createElement('div');
        card.className = 'horse-card';
        
        // Default image or placeholder
        const imgSrc = horse.img_path || '';
        const imgContent = imgSrc 
            ? `<img src="${imgSrc}" alt="${horse.horse_name}" class="horse-card-img">`
            : `<div class="horse-card-img">🐎</div>`;

        card.innerHTML = `
            <div class="horse-card-body">
                ${imgContent}
                <div class="horse-name">${horse.horse_name}</div>
                <button class="select-btn">Select</button>
            </div>
            <div>
                <hr aria-orientation="horizontal" class="list-divider">
            </div>
        `;

        const selectButton = card.querySelector('.select-btn');
        selectButton.addEventListener('click', () => {
            this.puzzleLogic.selectAnswer(horse);
            this.puzzleLogic.popup.popupOverlay.classList.add('hidden');
        });

        return card;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HorseRacingApp();
});
