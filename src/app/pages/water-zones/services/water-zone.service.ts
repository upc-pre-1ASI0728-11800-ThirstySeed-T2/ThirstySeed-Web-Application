import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateWaterZoneRequest,
  WaterConsumptionSummary,
  WaterDistributionPlan,
  WaterManagerDashboard,
  WaterZone,
} from '../model/water-zone.model';

@Injectable({ providedIn: 'root' })
export class WaterZoneService {
  private base = `${environment.apiBaseUrl}/api/v1`;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('jwtToken') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private pipe<T>(obs: Observable<T>): Observable<T> {
    return obs.pipe(catchError((err) => throwError(() => err)));
  }

  // ── Zone CRUD ──────────────────────────────────────────────────────────────

  // POST /api/v1/plot/zone
  createZone(payload: CreateWaterZoneRequest): Observable<WaterZone> {
    return this.pipe(
      this.http.post<WaterZone>(`${this.base}/plot/zone`, payload, { headers: this.headers() }),
    );
  }

  // GET /api/v1/plot/zones  (lista todas — útil para productores al vincular)
  getAllZones(): Observable<WaterZone[]> {
    return this.pipe(
      this.http.get<WaterZone[]>(`${this.base}/plot/zones`, { headers: this.headers() }),
    );
  }

  // GET /api/v1/plot/wm/{userId}/zone  ← fuente de verdad para el WM dashboard
  getZoneByWMUserId(userId: number): Observable<WaterZone> {
    return this.pipe(
      this.http.get<WaterZone>(`${this.base}/plot/wm/${userId}/zone`, { headers: this.headers() }),
    );
  }

  // ── Dashboard & Consumption ────────────────────────────────────────────────

  // GET /api/v1/plot/wm/{userId}/dashboard
  getWMDashboard(userId: number): Observable<WaterManagerDashboard> {
    return this.pipe(
      this.http.get<WaterManagerDashboard>(`${this.base}/plot/wm/${userId}/dashboard`, {
        headers: this.headers(),
      }),
    );
  }

  // GET /api/v1/zones/{zoneId}/water-consumption
  getWaterConsumption(zoneId: number): Observable<WaterConsumptionSummary> {
    return this.pipe(
      this.http.get<WaterConsumptionSummary>(`${this.base}/zones/${zoneId}/water-consumption`, {
        headers: this.headers(),
      }),
    );
  }

  // ── Water Distribution Plan ───────────────────────────────────────────────

  // GET /api/v1/plot/wm/{userId}/distribution
  getDistributionPlan(userId: number): Observable<WaterDistributionPlan> {
    return this.pipe(
      this.http.get<WaterDistributionPlan>(`${this.base}/plot/wm/${userId}/distribution`, {
        headers: this.headers(),
      }),
    );
  }

  // POST /api/v1/plot/wm/{userId}/distribution
  createDistributionPlan(
    userId: number,
    totalAvailableWater: number,
  ): Observable<WaterDistributionPlan> {
    return this.pipe(
      this.http.post<WaterDistributionPlan>(
        `${this.base}/plot/wm/${userId}/distribution`,
        { totalAvailableWater },
        { headers: this.headers() },
      ),
    );
  }

  // ── localStorage helpers (onboarding local) ──────────────────────────────

  saveZoneId(userId: number, zoneId: number): void {
    const key = `zoneIds_${userId}`;
    const ids: number[] = JSON.parse(localStorage.getItem(key) ?? '[]');
    if (!ids.includes(zoneId)) {
      ids.push(zoneId);
      localStorage.setItem(key, JSON.stringify(ids));
    }
  }

  // PUT /api/v1/plot/wm/{userId}/distribution/{planId}/item/{itemId}
  updateDistributionItem(
    userId: number,
    planId: number,
    itemId: number,
    assignedWaterAmount: number,
  ): Observable<WaterDistributionPlan> {
    return this.pipe(
      this.http.put<WaterDistributionPlan>(
        `${this.base}/plot/wm/${userId}/distribution/${planId}/item/${itemId}`,
        { assignedWaterAmount },
        { headers: this.headers() },
      ),
    );
  }
}
