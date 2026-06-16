import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Subscription {
  id: number;
  userId: number;
  planType: string;
  maxFarms: number;
  maxNodes: number;
  validationCode: string;
  status: string;
  active: boolean;
}

export interface CreateSubscriptionRequest {
  userId: number;
  planType: 'PLUS' | 'PREMIUM';
}

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {

  private apiUrl = `${environment.apiBaseUrl}/api/v1/subscriptions`;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('jwtToken') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getByUserId(userId: number): Observable<Subscription> {
    return this.http
      .get<Subscription>(`${this.apiUrl}/user/${userId}`, { headers: this.headers() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  createSubscription(payload: CreateSubscriptionRequest): Observable<Subscription> {
    return this.http
      .post<Subscription>(this.apiUrl, payload, { headers: this.headers() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getById(subscriptionId: number): Observable<Subscription> {
    return this.http
      .get<Subscription>(`${this.apiUrl}/${subscriptionId}`, { headers: this.headers() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  delete(subscriptionId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${subscriptionId}`, { headers: this.headers() })
      .pipe(catchError((err) => throwError(() => err)));
  }
}
