import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CreateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profileImage: string;
  location: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = `${environment.apiBaseUrl}/api/v1/profiles`;

  constructor(private http: HttpClient) {}

  createProfile(profile: CreateProfileRequest): Observable<any> {
    const token = localStorage.getItem('jwtToken');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(this.apiUrl, profile, { headers });
  }
}
