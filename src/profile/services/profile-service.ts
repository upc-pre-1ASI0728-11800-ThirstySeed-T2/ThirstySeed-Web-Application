import axios from 'axios'
import type { Profile } from '../model/Profile'

class ProfileService {
    // URL base de la API de perfiles
    private baseURL = 'https://thirstyseedapi-production.up.railway.app/api/v1/profiles'

    /**
     * Obtiene todos los perfiles.
     * @returns Una promesa que resuelve la lista de perfiles.
     */
    getAllProfiles() {
        return axios.get(`${this.baseURL}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    /**
     * Crea un nuevo perfil.
     * @param profile - El perfil a crear.
     * @returns Una promesa que resuelve el perfil creado.
     */
    createProfile(profile: Profile) {
        return axios.post(`${this.baseURL}`, profile, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    /**
     * Obtiene un perfil por su ID.
     * @param profileId - El ID del perfil a obtener.
     * @returns Una promesa que resuelve el perfil solicitado.
     */
    getProfileById(profileId: number) {
        return axios.get(`${this.baseURL}/${profileId}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    /**
     * Elimina un perfil por su ID.
     * @param profileId - El ID del perfil a eliminar.
     * @returns Una promesa que resuelve la respuesta de la eliminación.
     */
    deleteProfile(profileId: number) {
        return axios.delete(`${this.baseURL}/${profileId}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}

export default new ProfileService()
