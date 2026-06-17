import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  cropName: string;
  waterDemand: string;
  coordinatesJson: string;
}

@Injectable({
  providedIn: 'root',
})
export class PlotService {

  private baseUrl = `${environment.apiBaseUrl}/api/v1`;
  private readonly LOCAL_PLOTS_KEY = 'configuredPlots';

  constructor(private http: HttpClient) {}

  // =========================
  // HEADERS CENTRALIZADOS
  // =========================
  private getHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('jwtToken') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // =========================
  // GET ALL PLOTS
  // =========================
  getAllPlots(): Observable<Plot[]> {
    return this.http.get<Plot[]>(
      `${this.baseUrl}/plots`,
      { headers: this.getHeaders() }
    );
  }

  // =========================
  // GET BY USER
  // =========================
  getPlotsByUser(userId: number): Observable<Plot[]> {
    return this.http.get<Plot[]>(
      `${this.baseUrl}/plots/user/${userId}`,
      { headers: this.getHeaders() }
    );
  }

  // =========================
  // GET BY ID
  // =========================
  getPlotById(plotId: number): Observable<Plot> {
    return this.http.get<Plot>(
      `${this.baseUrl}/plots/${plotId}`,
      { headers: this.getHeaders() }
    );
  }

  // =========================
  // CREATE PLOT
  // =========================
  createPlot(payload: CreatePlotRequest): Observable<number> {
    return this.http.post<number>(
      `${this.baseUrl}/plots`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  // =========================
  // CONFIGURE PLOT IN FARM
  // =========================
  createPlotInFarm(farmId: number, payload: ConfigurePlotRequest): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/farms/${farmId}/plots`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  getStoredPlots(userId: number): Plot[] {
    const raw = localStorage.getItem(this.getStoredPlotsKey(userId));
    return raw ? JSON.parse(raw) : [];
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
    return this.http.put<Plot>(`${this.baseUrl}/plots/${plotId}`, plot, { headers: this.getHeaders() });
  }

  deletePlot(plotId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/plots/${plotId}`, { headers: this.getHeaders() });
  }

  supplyWater(plotId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/plots/${plotId}/stocks`, {}, { headers: this.getHeaders() });
  }

  cutWater(plotId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/plots/${plotId}/outages`, {}, { headers: this.getHeaders() });
  }

  mergeWithStoredPlots(userId: number, backendPlots: Plot[]): Plot[] {
    const storedPlots = this.getStoredPlots(userId);
    if (storedPlots.length === 0) return backendPlots;

    const merged = [...backendPlots];

    for (const storedPlot of storedPlots) {
      // Backend's PlotResource does not include farmId, so compare by name + extension only
      const alreadyExists = merged.some(
        (plot) =>
          plot.id === storedPlot.id ||
          (plot.name === storedPlot.name && plot.extension === storedPlot.extension),
      );

      if (!alreadyExists) {
        merged.push(storedPlot);
      }
    }

    return merged;
  }

  private getStoredPlotsKey(userId: number): string {
    return `${this.LOCAL_PLOTS_KEY}_${userId}`;
  }
}
