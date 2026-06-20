import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  username: string;
  roles: string[];
  token: string;
  fullName?: string;
  email?: string;
  profileImage?: string;
  accountType?: string;
  subscription?: SubscriptionPlan;
}

export interface SubscriptionPlan {
  name: 'Plus' | 'Premium';
  price: number;
  maxNodes: number;
  features: string[];
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `${environment.apiBaseUrl}/api/v1/authentication`;
  private readonly CURRENT_USER_KEY = 'currentUser';
  private readonly JWT_KEY = 'jwtToken';

  constructor(private http: HttpClient) {}

  // ------------------ BACKEND SIGN-UP ------------------
  signUp(userData: { username: string; password: string; roles: string[] }): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/sign-up`, userData);
  }

  // ------------------ BACKEND SIGN-IN ------------------
  signIn(username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/sign-in`, { username, password }).pipe(
      tap((user) => {
        if (user.token) {
          this.setToken(user.token);
        }
        this.setCurrentUser(user);
      }),
    );
  }

  private platformId = inject(PLATFORM_ID);

  // ------------------ TOKEN ------------------
  setToken(token: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(this.JWT_KEY, token);
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    return localStorage.getItem(this.JWT_KEY);
  }

  // ------------------ CURRENT USER ------------------
  setCurrentUser(user: User) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const user = localStorage.getItem(this.CURRENT_USER_KEY);

    return user ? JSON.parse(user) : null;
  }

  logout(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.removeItem('userId');
    localStorage.removeItem(this.CURRENT_USER_KEY);
    localStorage.removeItem(this.JWT_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  hasRole(role: string): boolean {
    return this.getCurrentUser()?.roles.includes(role) ?? false;
  }

  getRouteForCurrentUser(): string {
    const roles = this.getCurrentUser()?.roles ?? [];

    if (roles.includes('ROLE_WATER_MANAGER')) return '/water-manager/dashboard';
    return '/dashboard';
  }

  // ------------------ SUBSCRIPTION (Opcional, si backend lo retorna) ------------------
  getCurrentSubscription(): SubscriptionPlan | null {
    return this.getCurrentUser()?.subscription ?? null;
  }
}
