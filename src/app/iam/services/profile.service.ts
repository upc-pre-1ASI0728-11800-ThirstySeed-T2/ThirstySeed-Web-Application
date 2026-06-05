import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateProfileRequest {
  userId: number;
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
  private apiUrl = 'https://thirstyseed-api.onrender.com/api/v1/profiles';

  constructor(private http: HttpClient) {}

  createProfile(profile: CreateProfileRequest): Observable<any> {
    return this.http.post(this.apiUrl, profile);
  }
}
