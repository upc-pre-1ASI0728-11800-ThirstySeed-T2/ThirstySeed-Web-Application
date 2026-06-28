import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  DigitalTwinSimulation,
  SaveSimulationRequest,
} from '../model/digital-twin-simulation.model';

@Injectable({ providedIn: 'root' })
export class DigitalTwinService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  saveSimulation(dto: SaveSimulationRequest): Observable<DigitalTwinSimulation> {
    return this.http.post<DigitalTwinSimulation>(
      `${this.apiUrl}/api/v1/digital-twins/simulations`,
      dto,
      { headers: this.getHeaders() },
    );
  }

  getSimulationById(simulationId: number): Observable<DigitalTwinSimulation> {
    return this.http.get<DigitalTwinSimulation>(
      `${this.apiUrl}/api/v1/digital-twins/simulations/${simulationId}`,
      { headers: this.getHeaders() },
    );
  }

  getMySimulations(): Observable<DigitalTwinSimulation[]> {
    return this.http.get<DigitalTwinSimulation[]>(
      `${this.apiUrl}/api/v1/digital-twins/simulations/me`,
      { headers: this.getHeaders() },
    );
  }
}
