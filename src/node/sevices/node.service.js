import axios from 'axios';

const API_URL = 'https://thirstyseedapi-production.up.railway.app/api/v1/node';

export const nodeService = {
    // Obtiene todos los nodos
    getAllNodes() {
        return axios.get(API_URL);
    },

    // Obtiene un nodo por ID
    getNodeById(id) {
        return axios.get(`${API_URL}/${id}`);
    },

    // Obtiene nodos por ID del plot
    getNodesByPlotId(plotId) {
        return axios.get(`${API_URL}/plot/${plotId}`);
    },

    // Crea un nodo nuevo
    createNode(nodeData) {
        return axios.post(API_URL, nodeData);
    },

    // Actualiza el location del nodo por su ID
    updateNode(id, nodelocation) {
        return axios.put(`${API_URL}/${id}`, { nodelocation });
    },

    // Elimina un nodo por ID
    deleteNode(id) {
        return axios.delete(`${API_URL}/${id}`);
    },

    // Obtiene un nodo por productCode
    getNodeByProductCode(productCode) {
        return axios.get(`${API_URL}/productcode/${productCode}`);
    }
};
