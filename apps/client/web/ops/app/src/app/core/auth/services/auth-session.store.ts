import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthUser } from './auth-api.client';

@Injectable({ providedIn: 'root' })
export class AuthSessionStore {
  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.rehydrate();
  }

  private rehydrate(): void {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const email = sessionStorage.getItem('email') || localStorage.getItem('email');

    if (token && this.isTokenValid(token)) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUserSubject.next({
          id: 0,
          email: email ?? '',
          role: payload.role || 'OPERATOR',
          token
      });
    } else {
      this.clear();
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  set(user: AuthUser): void {
    // Level 5: Use sessionStorage for sensitive tokens to prevent persistence across sessions
    sessionStorage.setItem('token', user.token);
    sessionStorage.setItem('email', user.email);

    // Optional: Keep email in localStorage for "Remember Me" but NOT the token
    localStorage.setItem('email', user.email);

    this.currentUserSubject.next(user);
  }

  clear(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('email');
    localStorage.removeItem('token'); // Cleanup legacy
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): AuthUser | null {
    const user = this.currentUserSubject.value;
    if (user && !this.isTokenValid(user.token)) {
        this.clear();
        return null;
    }
    return user;
  }

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return !!user;
  }

  getToken(): string | null {
    const user = this.getCurrentUser();
    return user ? user.token : null;
  }
}
