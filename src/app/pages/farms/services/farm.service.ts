import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of, shareReplay } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Farm } from '../model/farm.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FarmService {
  private baseUrl = `${environment.apiBaseUrl}/api/v1/farms`;
  private myFarms$?: Observable<Farm[]>;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getMyFarms(): Observable<Farm[]> {
    if (!this.myFarms$) {
      this.myFarms$ = this.http
        .get<Farm[]>(`${this.baseUrl}/producer/me`, { headers: this.getHeaders() })
        .pipe(shareReplay(1));
    }
    return this.myFarms$;
  }

  getAllFarms(): Observable<Farm[]> {
    return this.http.get<Farm[]>(this.baseUrl, { headers: this.getHeaders() });
  }

  getFarmById(farmId: number): Observable<Farm> {
    return this.http.get<Farm>(`${this.baseUrl}/${farmId}`, { headers: this.getHeaders() });
  }

  createFarm(farm: Partial<Farm>): Observable<number> {
    return this.http.post<number>(this.baseUrl, farm, { headers: this.getHeaders() }).pipe(
      tap(() => { this.myFarms$ = undefined; }),
    );
  }

  deleteFarm(farmId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${farmId}`, { headers: this.getHeaders() }).pipe(
      tap(() => { this.myFarms$ = undefined; }),
    );
  }

  // Guarda el ID de la farm en localStorage
  saveFarmId(userId: number, farmId: number): void {
    const key = `farmIds_${userId}`;
    const raw = localStorage.getItem(key);
    const ids: number[] = raw ? JSON.parse(raw) : [];
    if (!ids.includes(farmId)) {
      ids.push(farmId);
      localStorage.setItem(key, JSON.stringify(ids));
    }
  }

  // Recupera los IDs guardados
  getSavedFarmIds(userId: number): number[] {
    const raw = localStorage.getItem(`farmIds_${userId}`);
    return raw ? JSON.parse(raw) : [];
  }

  removeFarmId(userId: number, farmId: number): void {
    const key = `farmIds_${userId}`;
    const ids = this.getSavedFarmIds(userId).filter((id) => id !== farmId);
    localStorage.setItem(key, JSON.stringify(ids));
  }

  replaceSavedFarmIds(userId: number, farmIds: number[]): void {
    localStorage.setItem(`farmIds_${userId}`, JSON.stringify(farmIds));
  }

  // Carga todas las farms guardadas por ID
  getFarmsByIds(ids: number[]): Observable<Farm[]> {
    if (ids.length === 0) {
      return of([]);
    }

    const requests = ids.map((id) =>
      this.getFarmById(id).pipe(catchError(() => of(null))),
    );

    return forkJoin(requests).pipe(
      map((farms) => farms.filter((farm): farm is Farm => farm !== null)),
    );
  }
}
