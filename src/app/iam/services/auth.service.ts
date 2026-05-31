import { Injectable } from '@angular/core';

export interface User {
  id: number;
  fullName: string;
  email: string;
  username: string;
  accountType: string;
  password: string;

  subscription?: SubscriptionPlan;
}

export interface Subscription {
  userId: number;
  plan: 'Plus' | 'Premium';
  monthlyPrice: number;
  createdAt: string;
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
  private readonly USERS_KEY = 'users';
  private readonly CURRENT_USER_KEY = 'currentUser';
  private readonly SUBSCRIPTIONS_KEY = 'subscriptions';

  constructor() {}

  getUsers(): User[] {
    return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
  }

  login(email: string, password: string): User | null {
    const users = this.getUsers();

    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );

    if (!user) {
      return null;
    }

    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));

    return user;
  }

  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.CURRENT_USER_KEY);

    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  register(userData: Omit<User, 'id'>): User {
    const users = this.getUsers();

    const newUser: User = {
      id: Date.now(),
      ...userData,
    };

    users.push(newUser);

    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));

    return newUser;
  }

  emailExists(email: string): boolean {
    return this.getUsers().some((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  usernameExists(username: string): boolean {
    return this.getUsers().some((user) => user.username.toLowerCase() === username.toLowerCase());
  }

  saveSubscription(userId: number, plan: 'Plus' | 'Premium'): void {
    const users = this.getUsers();

    const user = users.find((u) => u.id === userId);

    if (!user) {
      return;
    }

    if (plan === 'Plus') {
      user.subscription = {
        name: 'Plus',
        price: 19,
        maxNodes: 3,
        features: ['Basic plot monitoring', 'Water stress alerts', 'Sensor history access'],
      };
    } else {
      user.subscription = {
        name: 'Premium',
        price: 39,
        maxNodes: 10,
        features: ['Predictive irrigation', 'Weather support', 'Priority alerts & reports'],
      };
    }

    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }

  getCurrentSubscription(): SubscriptionPlan | null {
    return this.getCurrentUser()?.subscription ?? null;
  }

  getSubscriptionByUserId(userId: number) {
    const subscriptions = JSON.parse(localStorage.getItem(this.SUBSCRIPTIONS_KEY) || '[]');

    return subscriptions.find((s: any) => s.userId === userId);
  }

  updatePassword(email: string, newPassword: string): boolean {
    const users = this.getUsers();

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return false;
    }

    user.password = newPassword;

    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    const currentUser = this.getCurrentUser();

    if (currentUser && currentUser.id === user.id) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    }

    return true;
  }
}
