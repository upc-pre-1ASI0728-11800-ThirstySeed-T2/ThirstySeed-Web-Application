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

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private apiUrl = `${environment.apiBaseUrl}/api/v1/subscriptions`;

  constructor(private http: HttpClient) {}

  getByUserId(userId: number): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.apiUrl}/user/${userId}`);
  }
}
