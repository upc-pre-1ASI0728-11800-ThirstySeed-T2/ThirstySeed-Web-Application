import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { Plot } from '../model/plot.model';
import { environment } from '../../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PlotService {
  private baseUrl = `${environment.apiBaseUrl}/api/v1/plots`;

  constructor(private http: HttpClient) {}

  getPlotsByUser(userId: number): Observable<Plot[]> {
    return this.http.get<Plot[]>(`${this.baseUrl}/user/${userId}`, { headers: this.getHeaders() });
  }

  getPlotById(plotId: number): Observable<Plot> {
    return this.http.get<Plot>(`${this.baseUrl}/${plotId}`);
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken') ?? '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  createPlot(plot: Partial<Plot>): Observable<Plot> {
    return this.http.post<Plot>(this.baseUrl, plot, { headers: this.getHeaders() });
  }

  savePlotId(userId: number, plotId: number): void {
    const key = `plotIds_${userId}`;
    const raw = localStorage.getItem(key);
    const ids: number[] = raw ? JSON.parse(raw) : [];

    if (!ids.includes(plotId)) {
      ids.push(plotId);
      localStorage.setItem(key, JSON.stringify(ids));
    }
  }
  updatePlot(plotId: number, plot: Partial<Plot>): Observable<Plot> {
    return this.http.put<Plot>(`${this.baseUrl}/${plotId}`, plot);
  }
}
