class SearchEngine {
    constructor() {
        this.debounceTimeout = null;
        this.debounceDelay = 300; 
        this.allHorses = []; // Cache all horses 
    }
    /** fetch */
    async fetchAllHorses() {
        try {
            const response = await fetch('http://localhost:5000/api/horses/full-data');
            const data = await response.json();
            this.allHorses = data.horses;
            return this.allHorses;  
        }catch (error) {
            console.error('Error fetching horses:', error);
            return [];
        }
    }

    /**
     * @param {string} query - The search query
     * @param {Array} horses - Array of all horses
     * @returns {Array} - Filtered horses
     */
    search(query, horses = null) {
        const dataToSearch = horses || this.allHorses;

        const searchTerm = query.toLowerCase().trim();

        return dataToSearch.filter(horse => {
            return horse.horse_name.toLowerCase().includes(searchTerm) 
        });
    }
     /**
     * Debounced search to optimize performance
     * @param {Function} callback - Function to execute with results
     * @param {string} query - Search query
     */
    debounceSearch(callback, query) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
            const results = this.search(query);
            callback(results);
        }, this.debounceDelay);
    }
}

window.SearchEngine = SearchEngine;