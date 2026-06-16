import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateWaterZoneRequest,
  WaterConsumptionSummary,
  WaterZone,
} from '../model/water-zone.model';

@Injectable({ providedIn: 'root' })
export class WaterZoneService {
  private baseUrl = `${environment.apiBaseUrl}/api/v1`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // POST /api/v1/plot/zone
  createZone(payload: CreateWaterZoneRequest): Observable<WaterZone> {
    return this.http
      .post<WaterZone>(`${this.baseUrl}/plot/zone`, payload, {
        headers: this.getHeaders(),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // GET /api/v1/zones/{zoneId}/water-consumption
  getWaterConsumption(zoneId: number): Observable<WaterConsumptionSummary> {
    return this.http
      .get<WaterConsumptionSummary>(
        `${this.baseUrl}/zones/${zoneId}/water-consumption`,
        { headers: this.getHeaders() },
      )
      .pipe(catchError((err) => throwError(() => err)));
  }

  saveZoneId(userId: number, zoneId: number): void {
    const key = `zoneIds_${userId}`;
    const raw = localStorage.getItem(key);
    const ids: number[] = raw ? JSON.parse(raw) : [];
    if (!ids.includes(zoneId)) {
      ids.push(zoneId);
      localStorage.setItem(key, JSON.stringify(ids));
    }
  }

  getSavedZoneIds(userId: number): number[] {
    const raw = localStorage.getItem(`zoneIds_${userId}`);
    return raw ? JSON.parse(raw) : [];
  }
}
