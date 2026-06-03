import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Farm } from '../model/farm.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class FarmService {
private baseUrl = 'https://thirstyseed-api.onrender.com/api/v1/farms';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
getFarmsByProducer(producerId: number): Observable<Farm[]> {
  return this.http.get<Farm[]>(this.baseUrl, { headers: this.getHeaders() }).pipe(
    map((farms: Farm[]) => farms.filter(f => f.producerId === producerId))
  );
}
  // GET /api/v1/farms
  getAllFarms(): Observable<Farm[]> {
    return this.http.get<Farm[]>(this.baseUrl, { headers: this.getHeaders() });
  }

  // GET /api/v1/farms/{farmId}
  getFarmById(farmId: number): Observable<Farm> {
    return this.http.get<Farm>(`${this.baseUrl}/${farmId}`, { headers: this.getHeaders() });
  }

  // POST /api/v1/farms
  createFarm(farm: Partial<Farm>): Observable<Farm> {
    return this.http.post<Farm>(this.baseUrl, farm, { headers: this.getHeaders() });
  }
}