import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap, map, catchError } from 'rxjs';
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
    return this.http.post<any>(`${this.baseUrl}/auth/login`, credentials, { withCredentials: true }).pipe(
      tap(res => {
        if (res.user) {
          this._currentUser.set(res.user);
        } else if (!res.mfaRequired) {
          // If no user object but not MFA, try to get user info
          this.checkAuthStatus().subscribe();
        }
      })
    );
  }

  logout(redirect = true): void {
    this._currentUser.set(null);
    if (redirect) {
      this.router.navigate(['/auth/login']);
    }
  }

  checkAuthStatus(): Observable<boolean> {
    return this.http.get<any>(`${this.baseUrl}/auth/me`, { withCredentials: true }).pipe(
      tap(user => this._currentUser.set(user)),
      map(user => !!user),
      catchError(() => {
        this._currentUser.set(null);
        return of(false);
      })
    );
  }

  refreshAccessToken(): Observable<string> {
    return this.http.post<any>(`${this.baseUrl}/auth/refresh`, {}, { withCredentials: true }).pipe(
      map(res => res.accessToken),
      catchError(err => {
        this.logout();
        throw err;
      })
    );
  }

  hasPermissions(requiredPermissions: string[]): boolean {
    return hasPermission(this._currentUser()?.permissions, requiredPermissions);
  }
}
