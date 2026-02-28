import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthUser } from './auth-api.client';

@Injectable({ providedIn: 'root' })
export class AuthSessionStore {
  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    if (token) {
      this.currentUserSubject.next({ id: 0, email: email ?? '', role: '', token });
    }
  }

  set(user: AuthUser): void {
    localStorage.setItem('token', user.token);
    localStorage.setItem('email', user.email);
    this.currentUserSubject.next(user);
  }

  clear(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value || !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
