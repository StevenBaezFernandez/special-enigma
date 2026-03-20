import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { API_URL } from '@virteex/shared-config';
import { hasPermission } from '@virteex/shared-util-auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly baseUrl = inject(API_URL, { optional: true }) || '/api';

  private _currentUser = signal<any>(null);
  public readonly currentUser = computed(() => this._currentUser());
  public readonly isAuthenticated = computed(() => !!this._currentUser());
  public isAuthenticated$ = toObservable(this.isAuthenticated);

  constructor() {}

  login(credentials: any): Observable<any> {
    return of({ user: { id: '1', email: credentials.email } });
  }

  logout(redirect = true): void {
    this._currentUser.set(null);
    if (redirect) {
      this.router.navigate(['/auth/login']);
    }
  }

  checkAuthStatus(): Observable<boolean> {
    return of(this.isAuthenticated());
  }

  refreshAccessToken(): Observable<string> {
    return of('invalid-token-fallback');
  }

  hasPermissions(requiredPermissions: string[]): boolean {
    return hasPermission(this._currentUser()?.permissions, requiredPermissions);
  }
}
