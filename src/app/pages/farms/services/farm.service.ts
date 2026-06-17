import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs';
import { Farm } from '../model/farm.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FarmService {
  private baseUrl = `${environment.apiBaseUrl}/api/v1/farms`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // GET /api/v1/farms
  getAllFarms(): Observable<Farm[]> {
    return this.http.get<Farm[]>(this.baseUrl, { headers: this.getHeaders() });
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
  saveFarmId(userId: number, farmId: number): void {
    const key = `farmIds_${userId}`;
    const raw = localStorage.getItem(key);
    const ids: number[] = raw ? JSON.parse(raw) : [];
    if (!ids.includes(farmId)) {
      ids.push(farmId);
      localStorage.setItem(key, JSON.stringify(ids));
    }
  }

  // Recupera los IDs guardados
  getSavedFarmIds(userId: number): number[] {
    const raw = localStorage.getItem(`farmIds_${userId}`);
    return raw ? JSON.parse(raw) : [];
  }

  // Carga todas las farms guardadas por ID
  getFarmsByIds(ids: number[]): Observable<Farm[]> {
    const requests = ids.map((id) => this.getFarmById(id));
    return forkJoin(requests);
  }
}
