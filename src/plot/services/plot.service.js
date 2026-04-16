import axios from 'axios';

const API_URL = 'https://thirstyseedapi-production.up.railway.app/api/v1/plot';

export const plotService = {
    async getCurrentUser() {
        const userId = localStorage.getItem('userId');
        if (!userId) return null;
        return { id: userId };
    },

    async createPlot(plotData) {
        try {
            const response = await axios.post(API_URL, plotData);
            return response.data;
        } catch (error) {
            console.error('Error creating plot:', error.response?.data || error.message);
            throw error;
        }
    },

    async getPlotsByUserId(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }
        return axios.get(`${API_URL}/user/${userId}`);
    },

    async getPlotById(id) {
        return axios.get(`${API_URL}/${id}`);
    },

    async updatePlot(id, plotData) {
        try {
            const token = localStorage.getItem('authToken'); // Si tu API requiere autenticación
            const response = await axios.put(`${API_URL}/${id}`, plotData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error updating plot:', error.response?.data || error.message);
            throw error;
        }
    },

    async deletePlot(id) {
        try {
            const token = localStorage.getItem('authToken'); // Si tu API requiere autenticación
            return axios.delete(`${API_URL}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error('Error deleting plot:', error.response?.data || error.message);
            throw error;
        }
    },

    async getAllPlots() {
        const token = localStorage.getItem('authToken');
        return axios.get(API_URL, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },
};
