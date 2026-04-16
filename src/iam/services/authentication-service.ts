import axios from 'axios';
import type { User } from '../model/User';

class AuthenticationService {
  // URL base de la API de autenticación
  private baseURL = 'https://thirstyseedapi-production.up.railway.app/api/v1/authentication';

  // Método para registrar un usuario
  signUp(user: User) {
    return axios.post(`${this.baseURL}/sign-up`, user, {
      headers: {
        'Content-type': 'application/json',
      },
    });

  }

  // Método para iniciar sesión
  signIn(user: User) {
    return axios.post(`${this.baseURL}/sign-in`, user, {
      headers: {
        'Content-type': 'application/json',
      },
    }).then((response) => {
      // Almacenar el token en localStorage después de un login exitoso
      if (response.status === 200 && response.data.token) {
        localStorage.setItem('token', response.data.token); // Guardar token
        localStorage.setItem('userId', response.data.userId); // Si necesitas también el userId
      }
      return response; // Devuelve la respuesta para continuar con el flujo
    }).catch((error) => {
      console.error('Error al iniciar sesión:', error);
      throw error; // Lanza el error para que pueda ser manejado por quien invoque el servicio
    });
  }
}

export default new AuthenticationService();
