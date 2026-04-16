import axios from 'axios';
import type { Schedule } from '../models/Schedule';

class ScheduleService {
  // URL base de la API de perfiles
  private baseURL = 'https://thirstyseedapi-production.up.railway.app/api/v1/schedules';

  // Obtener un schedule por ID
  async getScheduleById(scheduleId: string): Promise<Schedule> {
    try {
      const response = await axios.get(`${this.baseURL}/${scheduleId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener el schedule: ${error}`);
    }
  }

  // Actualizar un schedule por ID
  async updateSchedule(scheduleId: string, scheduleData: Schedule): Promise<Schedule> {
    try {
      const response = await axios.put(`${this.baseURL}/${scheduleId}`, scheduleData);
      return response.data;
    } catch (error) {
      throw new Error(`Error al actualizar el schedule: ${error}`);
    }
  }

  // Eliminar un schedule por ID
  async deleteSchedule(scheduleId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${scheduleId}`);
    } catch (error) {
      throw new Error(`Error al eliminar el schedule: ${error}`);
    }
  }

  // Obtener todos los schedules
  async getAllSchedules(): Promise<Schedule[]> {
    try {
      const response = await axios.get(this.baseURL);
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener todos los schedules: ${error}`);
    }
  }

  async createSchedule(scheduleData: Schedule): Promise<Schedule> {
    try {
      console.log('Datos enviados al backend:', scheduleData);
      const response = await axios.post(this.baseURL, scheduleData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al crear el schedule:', error.response || error.message);
      throw new Error(`Error al crear el schedule: ${error.response?.data?.message || error.message}`);
    }
  }
  
  

  // Obtener schedules del usuario actual
  async getSchedulesByCurrentUser(): Promise<Schedule[]> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const response = await axios.get(`${this.baseURL}/user/${currentUser.id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener schedules del usuario: ${error}`);
    }
  }

  // Obtener schedules por plot
  async getSchedulesByPlot(plotId: string): Promise<Schedule[]> {
    try {
      const response = await axios.get(`${this.baseURL}/plot/${plotId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener schedules del plot: ${error}`);
    }
  }

  // Obtener usuario actual
  private async getCurrentUser() {
    const userId = localStorage.getItem('userId');
    if (!userId) return null;
    return { id: Number(userId) };
  }
}

export default new ScheduleService();