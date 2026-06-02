import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plot } from '../model/plot.model';

@Injectable({
  providedIn: 'root'
})
export class PlotService {
private baseUrl = 'https://thirstyseed-api.onrender.com/api/v1/plot';

  constructor(private http: HttpClient) {}

  getPlotsByUser(userId: number): Observable<Plot[]> {
    return this.http.get<Plot[]>(`${this.baseUrl}/user/${userId}`);
  }

  getPlotById(plotId: number): Observable<Plot> {
    return this.http.get<Plot>(`${this.baseUrl}/${plotId}`);
  }

  createPlot(plot: Partial<Plot>): Observable<Plot> {
    return this.http.post<Plot>(this.baseUrl, plot);
  }

  updatePlot(plotId: number, plot: Partial<Plot>): Observable<Plot> {
    return this.http.put<Plot>(`${this.baseUrl}/${plotId}`, plot);
  }
}