import { TelemetryReading } from '../model/telemetry.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { WaterStressAssessment } from '../model/water-stress.model';
import { TelemetryNode } from '../model/node.model';



@Injectable({
  providedIn: 'root',
})
export class TelemetryService {
  getMockReadings(): TelemetryReading[] {
    return [
      {
        timestamp: '09:00',
        soilMoisture: 52,
        temperature: 26,
        nodeStatus: 'Online',
      },
      {
        timestamp: '12:00',
        soilMoisture: 48,
        temperature: 29,
        nodeStatus: 'Online',
      },
      {
        timestamp: '15:00',
        soilMoisture: 40,
        temperature: 31,
        nodeStatus: 'Online',
      },
      {
        timestamp: '18:00',
        soilMoisture: 25,
        temperature: 34,
        nodeStatus: 'Online',
      },
      {
        timestamp: '21:00',
        soilMoisture: 34,
        temperature: 28,
        nodeStatus: 'Online',
      },
    ];
  }

  constructor(private http: HttpClient) {}

  private apiUrl = environment.apiBaseUrl;
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken') ?? '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getAssessmentsByPlot(plotId: number): Observable<WaterStressAssessment[]> {
    return this.http.get<WaterStressAssessment[]>(
      `${this.apiUrl}/api/v1/telemetry/assessments/plots/${plotId}`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  getNodesByPlot(plotId: number) {
    return this.http.get<TelemetryNode[]>(`${this.apiUrl}/api/v1/nodes/plot/${plotId}`, {
      headers: this.getHeaders(),
    });
  }
}
