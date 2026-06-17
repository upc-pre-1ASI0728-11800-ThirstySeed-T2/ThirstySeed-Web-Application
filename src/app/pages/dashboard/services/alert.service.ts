import { PlotAlert } from '../model/dashboard.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private apiUrl = `${environment.apiBaseUrl}/api/v1`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken') ?? '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getAlertsByPlot(plotId: number) {
    return this.http.get<PlotAlert[]>(`${this.apiUrl}/alerts/plot/${plotId}`, {
      headers: this.getHeaders(),
    });
  }
}
