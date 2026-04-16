import axios from 'axios';
import type { Plot } from '../models/Plot';

class PlotService {
  // URL base de la API de plots
  private baseURL = 'https://thirstyseedapi-production.up.railway.app/api/v1/plot';

  
  async getCurrentUser() {
    const userId = localStorage.getItem('userId');
    if (!userId) return null;
    return { id: Number(userId) };
  }

  // Obtener un plot por ID
  async getPlotById(plotId: string): Promise<Plot> {
    try {
      const response = await axios.get(`${this.baseURL}/${plotId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Error al obtener el plot: ${error.response?.data?.message || error.message}`);
    }
  }

  // Actualizar un plot por ID
  async updatePlot(plotId: string, plotData: Plot): Promise<Plot> {
    try {
      const response = await axios.put(`${this.baseURL}/${plotId}`, plotData);
      return response.data;
    } catch (error: any) {
      throw new Error(`Error al actualizar el plot: ${error.response?.data?.message || error.message}`);
    }
  }

  // Eliminar un plot por ID
  async deletePlot(plotId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${plotId}`);
    } catch (error: any) {
      throw new Error(`Error al eliminar el plot: ${error.response?.data?.message || error.message}`);
    }
  }

  // Obtener todos los plots
  async getAllPlots(): Promise<Plot[]> {
    try {
      const response = await axios.get(this.baseURL);
      return response.data;
    } catch (error: any) {
      throw new Error(`Error al obtener todos los plots: ${error.response?.data?.message || error.message}`);
    }
  }

  // Crear un nuevo plot
  async createPlot(plotData: Plot): Promise<Plot> {
    try {
      const response = await axios.post(this.baseURL, plotData);
      return response.data;
    } catch (error: any) {
      throw new Error(`Error al crear el plot: ${error.response?.data?.message || error.message}`);
    }
  }

  // Obtener plots por usuario
  async getPlotsByCurrentUser(): Promise<Plot[]> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const response = await axios.get(`${this.baseURL}/user/${currentUser.id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Error al obtener plots del usuario: ${error.response?.data?.message || error.message}`);
    }
  }

}

export default new PlotService();