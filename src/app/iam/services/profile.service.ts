import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  location: string;
}

export interface ProfilePayload {
  userId?: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: string;
  profileImage?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = `${environment.apiBaseUrl}/api/v1/profiles`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // GET /api/v1/profiles/user/{userId}
  getProfileByUserId(userId: number): Observable<UserProfile | null> {
    return this.http
      .get<UserProfile>(`${this.apiUrl}/user/${userId}`, { headers: this.getHeaders() })
      .pipe(catchError(() => of(null)));
  }

  // POST /api/v1/profiles
  createProfile(payload: ProfilePayload): Observable<UserProfile> {
    return this.http.post<UserProfile>(this.apiUrl, payload, { headers: this.getHeaders() });
  }

  // PUT /api/v1/profiles/{profileId}
  updateProfile(profileId: number, payload: ProfilePayload): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/${profileId}`, payload, {
      headers: this.getHeaders(),
    });
  }

  // DELETE /api/v1/profiles/{profileId}
  deleteProfile(profileId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${profileId}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }

  // DELETE /api/v1/users/{userId}
  deleteUser(userId: string | number): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiBaseUrl}/api/v1/users/${userId}`, { headers: this.getHeaders() })
      .pipe(catchError((err) => throwError(() => err)));
  }
}
