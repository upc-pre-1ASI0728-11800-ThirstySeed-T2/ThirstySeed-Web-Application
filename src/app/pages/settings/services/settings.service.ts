import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  providedIn: 'root'
})
export class SettingsService {

  private baseUrl = `${environment.apiBaseUrl}/api/v1/profiles`;

  constructor(private http: HttpClient) {}

  getProfileByUserId(userId: string) {
    return this.http.get(`${this.baseUrl}/user/${userId}`);
  }

  createProfile(data: ProfilePayload): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  updateProfile(profileId: string, data: ProfilePayload) {
    return this.http.put(`${this.baseUrl}/${profileId}`, data);
  }

  deleteProfile(profileId: string) {
    return this.http.delete(`${this.baseUrl}/${profileId}`);
  }

  deleteUser(userId: string) {
    return this.http.delete(
      `${environment.apiBaseUrl}/api/v1/users/${userId}`
    );
  }
  getSubscriptionByUserId(userId: string) {
  return this.http.get(
    `${environment.apiBaseUrl}/api/v1/subscriptions/user/${userId}`
  );
}
}
