import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
import { Farm } from '../model/farm.model';

@Injectable({ providedIn: 'root' })
export class FarmService {
  private baseUrl = 'https://thirstyseed-api.onrender.com/api/v1/farms';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // GET /api/v1/farms/{farmId}
  getFarmById(farmId: number): Observable<Farm> {
    return this.http.get<Farm>(`${this.baseUrl}/${farmId}`, { headers: this.getHeaders() });
  }

  // POST /api/v1/farms — devuelve el ID (number)
  createFarm(farm: Partial<Farm>): Observable<number> {
    return this.http.post<number>(this.baseUrl, farm, { headers: this.getHeaders() });
  }

  // Guarda el ID de la farm en localStorage
  saveFarmId(farmId: number): void {
    const ids = this.getSavedFarmIds();
    if (!ids.includes(farmId)) {
      ids.push(farmId);
      localStorage.setItem('farmIds', JSON.stringify(ids));
    }
  }

  // Recupera los IDs guardados
  getSavedFarmIds(): number[] {
    const raw = localStorage.getItem('farmIds');
    return raw ? JSON.parse(raw) : [];
  }

  // Carga todas las farms guardadas por ID
  getFarmsByIds(ids: number[]): Observable<Farm[]> {
    const requests = ids.map(id => this.getFarmById(id));
    return forkJoin(requests);
  }
}