class ApiService {
    constructor(baseUrl = 'http://localhost:5000/api') {
        this.baseUrl = baseUrl;
    }

    async getAllHorses() {
        try {
            const response = await fetch(`${this.baseUrl}/horses/full-data`);
            if (!response.ok) throw new Error('Failed to fetch horses');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

     /**
     * Search horses (server-side)
     */
    async searchHorses(query) {
        try {
            const response = await fetch(`${this.baseUrl}/horses/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Search failed');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async advancedSearch(filters) {
        try{
            const params = new URLSearchParams();
            if (filters.birth) params.append('birth', filters.birth);
            if (filters.color) params.append('color', filters.color);
            if (filters.G1_wins) params.append('G1_wins', filters.G1_wins);
            if (filters.race_name) params.append('race_name', filters.race_name);
            if (filters.race_distance) params.append('race_distance', filters.race_distance);
            if (filters.race_ground) params.append('race_ground', filters.race_ground);
            if (filters.race_distance_min) params.append('race_distance_min', filters.race_distance_min);
            if (filters.race_distance_max) params.append('race_distance_max', filters.race_distance_max);
            if (filters.race_ids) params.append('race_ids', filters.race_ids);
        
            const response = await fetch(`http://localhost:5000/api/horses/search?${params}`);
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
}

}   
