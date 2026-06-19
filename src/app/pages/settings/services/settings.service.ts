import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ProfilePayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  location?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {

  private baseUrl = `${environment.apiBaseUrl}/api/v1/profiles`;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('jwtToken') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getProfileByUserId(userId: string): Observable<any> {
    return this.http
      .get(`${this.baseUrl}/user/${userId}`, { headers: this.headers() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  createProfile(data: ProfilePayload): Observable<any> {
    return this.http
      .post(this.baseUrl, data, { headers: this.headers() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  updateProfile(profileId: string, data: ProfilePayload): Observable<any> {
    return this.http
      .put(`${this.baseUrl}/${profileId}`, data, { headers: this.headers() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteProfile(profileId: string): Observable<any> {
    return this.http
      .delete(`${this.baseUrl}/${profileId}`, { headers: this.headers() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  deleteUser(userId: string): Observable<any> {
    return this.http
      .delete(`${environment.apiBaseUrl}/api/v1/users/${userId}`, { headers: this.headers() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getSubscriptionByUserId(userId: string): Observable<any> {
    return this.http
      .get(`${environment.apiBaseUrl}/api/v1/subscriptions/user/${userId}`, { headers: this.headers() })
      .pipe(catchError((err) => throwError(() => err)));
  }
}
