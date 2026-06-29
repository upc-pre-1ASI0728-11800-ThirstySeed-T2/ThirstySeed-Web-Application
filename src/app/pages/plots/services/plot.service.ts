import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, shareReplay, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Plot } from '../model/plot.model';

export interface CreatePlotRequest {
  userId: number;
  name: string;
  location: string;
  extension: number;
  imageUrl: string;
}

export interface ConfigurePlotRequest {
  name: string;
  cropName: string;
  waterDemand: 'HIGH' | 'MODERATE' | 'LOW';
  area: number;
  soilType?: string;
  irrigationSystem?: string;
  description?: string;
  coordinatesJson?: string | null;
  latitude?: number;
  longitude?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PlotService {
  private baseUrl = `${environment.apiBaseUrl}/api/v1`;
  private readonly LOCAL_PLOTS_KEY = 'configuredPlots';
  private plotsByUser$ = new Map<number, Observable<Plot[]>>();

  constructor(private http: HttpClient) {}

  // =========================
  // HEADERS CENTRALIZADOS
  // =========================
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken') ?? '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // =========================
  // GET ALL PLOTS
  // =========================
  getAllPlots(): Observable<Plot[]> {
    return this.http.get<Plot[]>(`${this.baseUrl}/plots`, { headers: this.getHeaders() });
  }

  // =========================
  // GET BY USER
  // =========================
  getPlotsByUser(userId: number): Observable<Plot[]> {
    if (!this.plotsByUser$.has(userId)) {
      const obs$ = this.http
        .get<Plot[]>(`${this.baseUrl}/plots/user/${userId}`, { headers: this.getHeaders() })
        .pipe(shareReplay(1));
      this.plotsByUser$.set(userId, obs$);
    }
    return this.plotsByUser$.get(userId)!;
  }

  // =========================
  // GET BY ID
  // =========================
  getPlotById(plotId: number): Observable<Plot> {
    return this.http.get<Plot>(`${this.baseUrl}/plots/${plotId}`, { headers: this.getHeaders() });
  }

  // =========================
  // CREATE PLOT
  // =========================
  createPlot(payload: CreatePlotRequest): Observable<number> {
    return this.http
      .post<number>(`${this.baseUrl}/plots`, payload, { headers: this.getHeaders() })
      .pipe(tap(() => this.plotsByUser$.clear()));
  }

  // =========================
  // CONFIGURE PLOT IN FARM
  // =========================
  createPlotInFarm(farmId: number, payload: ConfigurePlotRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/farms/${farmId}/plots`, payload, {
      headers: this.getHeaders(),
    });
  }

  getStoredPlots(userId: number): Plot[] {
    const raw = localStorage.getItem(this.getStoredPlotsKey(userId));
    if (!raw) return [];

    const storedPlots = this.withoutSyncedPlaceholders(JSON.parse(raw));
    localStorage.setItem(this.getStoredPlotsKey(userId), JSON.stringify(storedPlots));

    return storedPlots;
  }

  saveStoredPlot(userId: number, plot: Plot): void {
    const plots = this.getStoredPlots(userId);
    const alreadyExists = plots.some(
      (storedPlot) =>
        storedPlot.farmId === plot.farmId &&
        storedPlot.name === plot.name &&
        storedPlot.extension === plot.extension,
    );

    if (!alreadyExists) {
      plots.push(plot);
      localStorage.setItem(this.getStoredPlotsKey(userId), JSON.stringify(plots));
    }
  }
  updatePlot(plotId: number, plot: Partial<Plot>): Observable<Plot> {
    return this.http.put<Plot>(`${this.baseUrl}/plots/${plotId}`, plot, {
      headers: this.getHeaders(),
    });
  }

  deletePlot(plotId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/plots/${plotId}`, { headers: this.getHeaders() })
      .pipe(tap(() => this.plotsByUser$.clear()));
  }

  updateStoredPlot(userId: number, updatedPlot: Plot): void {
    const storedPlots = this.getStoredPlots(userId);
    const exists = storedPlots.some((plot) => plot.id === updatedPlot.id);
    const plots = exists
      ? storedPlots.map((plot) => (plot.id === updatedPlot.id ? updatedPlot : plot))
      : [...storedPlots, updatedPlot];

    localStorage.setItem(this.getStoredPlotsKey(userId), JSON.stringify(plots));
  }

  deleteStoredPlot(userId: number, plotId: number): void {
    const plots = this.getStoredPlots(userId).filter((plot) => plot.id !== plotId);
    localStorage.setItem(this.getStoredPlotsKey(userId), JSON.stringify(plots));
  }

  deleteStoredPlotsByFarm(userId: number, farmId: number): void {
    const plots = this.getStoredPlots(userId).filter((plot) => plot.farmId !== farmId);
    localStorage.setItem(this.getStoredPlotsKey(userId), JSON.stringify(plots));
  }

  mergeWithStoredPlots(userId: number, backendPlots: Plot[]): Plot[] {
    backendPlots = this.withoutSyncedPlaceholders(backendPlots);
    const storedPlots = this.getStoredPlots(userId);
    if (storedPlots.length === 0) return backendPlots;

    const merged = [...backendPlots];

    for (const storedPlot of storedPlots) {
      // Backend's PlotResource does not include farmId, so compare by name + extension only
      const existingIndex = merged.findIndex((plot) => plot.id === storedPlot.id);
      const alreadyExists = existingIndex >= 0;

      if (!alreadyExists) {
        merged.push(storedPlot);
      } else {
        merged[existingIndex] = {
          ...merged[existingIndex],

          name: storedPlot.name || merged[existingIndex].name,
          extension: storedPlot.extension || merged[existingIndex].extension,
          farmId: storedPlot.farmId ?? merged[existingIndex].farmId,
          location: storedPlot.location || merged[existingIndex].location,
          status: storedPlot.status || merged[existingIndex].status,
          imageUrl: storedPlot.imageUrl || merged[existingIndex].imageUrl,
        };
      }
    }

    return merged;
  }

  private getStoredPlotsKey(userId: number): string {
    return `${this.LOCAL_PLOTS_KEY}_${userId}`;
  }

  private withoutSyncedPlaceholders(plots: Plot[]): Plot[] {
    return plots.filter((plot) => !this.isSyncedPlaceholder(plot));
  }

  private isSyncedPlaceholder(plot: Plot): boolean {
    return (plot.name || '').trim().toLowerCase() === 'parcela sincronizada';
  }
}
