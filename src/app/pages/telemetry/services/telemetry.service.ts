import { TelemetryReading } from '../model/telemetry.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';
import { WaterStressAssessment } from '../model/water-stress.model';
import { TelemetryNode } from '../model/node.model';
import {
  IrrigationRecommendation,
  IrrigationSchedule,
  TelemetryReadingPayload,
  TelemetrySnapshot,
} from '../model/recommendation.model';



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

  getNodesByPlot(plotId: number): Observable<TelemetryNode[]> {
    return this.http.get<TelemetryNode[]>(`${this.apiUrl}/api/v1/nodes/plot/${plotId}`, {
      headers: this.getHeaders(),
    });
  }

  // POST /api/v1/nodes — returns node ID (number)
  createNode(plotId: number, location: string): Observable<number> {
    return this.http
      .post<number>(
        `${this.apiUrl}/api/v1/nodes`,
        { plotId, location, moisture: 0, isActive: true },
        { headers: this.getHeaders() },
      )
      .pipe(catchError((err) => throwError(() => err)));
  }

  // POST /api/v1/telemetry/readings — envía UNA lectura (llámalo dos veces: moisture luego temp)
  sendReading(payload: TelemetryReadingPayload): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/api/v1/telemetry/readings`, payload, {
        headers: this.getHeaders(),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // GET /api/v1/recommendations/plot/{plotId}
  getRecommendationsByPlot(plotId: number): Observable<IrrigationRecommendation[]> {
    return this.http
      .get<IrrigationRecommendation[]>(
        `${this.apiUrl}/api/v1/recommendations/plot/${plotId}`,
        { headers: this.getHeaders() },
      )
      .pipe(catchError((err) => throwError(() => err)));
  }

  // PUT /api/v1/recommendations/{id}/accept
  acceptRecommendation(id: number): Observable<void> {
    return this.http
      .put<void>(
        `${this.apiUrl}/api/v1/recommendations/${id}/accept`,
        {},
        { headers: this.getHeaders() },
      )
      .pipe(catchError((err) => throwError(() => err)));
  }

  // GET /api/v1/plots/{plotId}/telemetry/latest
  getLatestSnapshot(plotId: number): Observable<TelemetrySnapshot> {
    return this.http
      .get<TelemetrySnapshot>(`${this.apiUrl}/api/v1/plots/${plotId}/telemetry/latest`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // GET /api/v1/schedules/plot/{plotId}
  getSchedulesByPlot(plotId: number): Observable<IrrigationSchedule[]> {
    return this.http
      .get<IrrigationSchedule[]>(`${this.apiUrl}/api/v1/schedules/plot/${plotId}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // GET /api/v1/plots/{plotId}/telemetry/history?hoursAgo=24
  getTelemetryHistory(plotId: number, hoursAgo = 24): Observable<TelemetrySnapshot[]> {
    return this.http
      .get<TelemetrySnapshot[]>(
        `${this.apiUrl}/api/v1/plots/${plotId}/telemetry/history?hoursAgo=${hoursAgo}`,
        { headers: this.getHeaders() },
      )
      .pipe(catchError((err) => throwError(() => err)));
  }
}
