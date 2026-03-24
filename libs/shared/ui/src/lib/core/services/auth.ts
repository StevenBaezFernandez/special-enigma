import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap, map, catchError, lastValueFrom } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { API_URL } from '@virteex/shared-config';
import { hasPermission } from '@virteex/shared-util-auth';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly baseUrl = inject(API_URL, { optional: true }) ? `${inject(API_URL)}/auth` : '/api/auth';

  private _currentUser = signal<any>(null);
  public readonly currentUser = computed(() => this._currentUser());
  public readonly isAuthenticated = computed(() => !!this._currentUser());
  public isAuthenticated$ = toObservable(this.isAuthenticated);

  constructor() {}

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials, { withCredentials: true }).pipe(
      tap(res => {
        if (res.user) {
          this._currentUser.set(res.user);
        } else if (!res.mfaRequired) {
          this.checkAuthStatus().subscribe();
        }
      })
    );
  }

  verifyMfa(dto: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/verify-mfa`, dto, { withCredentials: true }).pipe(
      tap(res => {
        if (res.user) {
          this._currentUser.set(res.user);
        } else {
          this.checkAuthStatus().subscribe();
        }
      })
    );
  }

  logout(redirect = true): void {
    this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true }).pipe(
        catchError(() => of(null))
    ).subscribe();

    this._currentUser.set(null);
    if (redirect) {
      this.router.navigate(['/auth/login']);
    }
  }

  checkAuthStatus(): Observable<boolean> {
    return this.http.get<any>(`${this.baseUrl}/me`, { withCredentials: true }).pipe(
      tap(user => this._currentUser.set(user)),
      map(user => !!user),
      catchError(() => {
        this._currentUser.set(null);
        return of(false);
      })
    );
  }

  refreshAccessToken(): Observable<void> {
    return this.http.post<any>(`${this.baseUrl}/refresh`, {}, { withCredentials: true }).pipe(
      map(() => undefined),
      catchError(err => {
        this.logout();
        throw err;
      })
    );
  }

  forgotPassword(email: string, recaptchaToken: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email, recaptchaToken });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, { token, password });
  }

  setPasswordFromInvitation(token: string, password: string, recaptchaToken: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/set-password`, { token, password, recaptchaToken }).pipe(
      tap(() => this.checkAuthStatus().subscribe())
    );
  }

  getSocialRegisterInfo(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/social-register-info?token=${token}`);
  }

  async registerPasskey(): Promise<any> {
    const options = await lastValueFrom(this.http.get<any>(`${this.baseUrl}/passkey/register-options`, { withCredentials: true }));
    const attResp = await startRegistration({ optionsJSON: options });
    return lastValueFrom(this.http.post(`${this.baseUrl}/passkey/register-verify`, attResp, { withCredentials: true }));
  }

  async loginWithPasskey(email?: string): Promise<any> {
    const options = await lastValueFrom(this.http.post<any>(`${this.baseUrl}/passkey/login-options`, { email }));
    const asseResp = await startAuthentication({ optionsJSON: options });
    const response = await lastValueFrom(this.http.post<any>(`${this.baseUrl}/passkey/login-verify`, asseResp, { withCredentials: true }));
    this.checkAuthStatus().subscribe();
    return response;
  }

  initiateSignup(dto: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup/initiate`, dto);
  }

  verifySignup(dto: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup/verify`, dto);
  }

  completeOnboarding(dto: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/signup/complete`, dto, { withCredentials: true }).pipe(
      tap(() => this.checkAuthStatus().subscribe())
    );
  }

  hasPermissions(requiredPermissions: string[]): boolean {
    return hasPermission(this._currentUser()?.permissions, requiredPermissions);
  }

  impersonate(userId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/impersonate`, { userId }, { withCredentials: true }).pipe(
      tap(() => this.checkAuthStatus().subscribe())
    );
  }

  changePassword(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/change-password`, data, { withCredentials: true });
  }
}
