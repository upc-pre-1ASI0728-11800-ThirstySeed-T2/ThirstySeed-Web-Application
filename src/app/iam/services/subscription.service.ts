import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  // 👇 obtener suscripción actual del usuario
  getByUserId(userId: number): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.apiUrl}/user/${userId}`);
  }

  // 👇 crear o cambiar suscripción (CAMBIO DE PLAN)
  createSubscription(payload: CreateSubscriptionRequest): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}`, payload);
  }

  // (opcional futuro)
  getById(subscriptionId: number): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.apiUrl}/${subscriptionId}`);
  }

  // (opcional futuro)
  delete(subscriptionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${subscriptionId}`);
  }
}
