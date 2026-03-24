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
  private readonly _baseUrl = inject(API_URL, { optional: true }) ? `${inject(API_URL)}/auth` : '/api/auth';

  public get baseUrl(): string {
      return this._baseUrl;
  }

  private _currentUser = signal<any>(null);
  public readonly currentUser = computed(() => this._currentUser());
  public readonly isAuthenticated = computed(() => !!this._currentUser());
  public isAuthenticated$ = toObservable(this.isAuthenticated);

  constructor() {}

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this._baseUrl}/login`, credentials, { withCredentials: true }).pipe(
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
    return this.http.post<any>(`${this._baseUrl}/verify-mfa`, dto, { withCredentials: true }).pipe(
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
    this.http.post(`${this._baseUrl}/logout`, {}, { withCredentials: true }).pipe(
        catchError(() => of(null))
    ).subscribe();

    this._currentUser.set(null);
    if (redirect) {
      this.router.navigate(['/auth/login']);
    }
  }

  checkAuthStatus(): Observable<boolean> {
    return this.http.get<any>(`${this._baseUrl}/me`, { withCredentials: true }).pipe(
      tap(user => this._currentUser.set(user)),
      map(user => !!user),
      catchError(() => {
        this._currentUser.set(null);
        return of(false);
      })
    );
  }

  refreshAccessToken(): Observable<void> {
    return this.http.post<any>(`${this._baseUrl}/refresh`, {}, { withCredentials: true }).pipe(
      map(() => undefined),
      catchError(err => {
        this.logout();
        throw err;
      })
    );
  }

  forgotPassword(email: string, recaptchaToken: string): Observable<any> {
    return this.http.post(`${this._baseUrl}/forgot-password`, { email, recaptchaToken });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this._baseUrl}/reset-password`, { token, password });
  }

  setPasswordFromInvitation(token: string, password: string, recaptchaToken: string): Observable<any> {
    return this.http.post(`${this._baseUrl}/set-password`, { token, password, recaptchaToken }).pipe(
      tap(() => this.checkAuthStatus().subscribe())
    );
  }

  getSocialRegisterInfo(token: string): Observable<any> {
    return this.http.get(`${this._baseUrl}/social-register-info?token=${token}`);
  }

  async registerPasskey(): Promise<any> {
    const options = await lastValueFrom(this.http.get<any>(`${this._baseUrl}/passkey/register-options`, { withCredentials: true }));
    const attResp = await startRegistration({ optionsJSON: options });
    return lastValueFrom(this.http.post(`${this._baseUrl}/passkey/register-verify`, attResp, { withCredentials: true }));
  }

  async loginWithPasskey(email?: string): Promise<any> {
    const options = await lastValueFrom(this.http.post<any>(`${this._baseUrl}/passkey/login-options`, { email }));
    const asseResp = await startAuthentication({ optionsJSON: options });
    const response = await lastValueFrom(this.http.post<any>(`${this._baseUrl}/passkey/login-verify`, asseResp, { withCredentials: true }));
    this.checkAuthStatus().subscribe();
    return response;
  }

  initiateSignup(dto: any): Observable<any> {
    return this.http.post(`${this._baseUrl}/signup/initiate`, dto);
  }

  verifySignup(dto: any): Observable<any> {
    return this.http.post(`${this._baseUrl}/signup/verify`, dto);
  }

  completeOnboarding(dto: any): Observable<any> {
    return this.http.post<any>(`${this._baseUrl}/signup/complete`, dto, { withCredentials: true }).pipe(
      tap(() => this.checkAuthStatus().subscribe())
    );
  }

  hasPermissions(requiredPermissions: string[]): boolean {
    return hasPermission(this._currentUser()?.permissions, requiredPermissions);
  }

  impersonate(userId: string): Observable<any> {
    return this.http.post<any>(`${this._baseUrl}/impersonate`, { userId }, { withCredentials: true }).pipe(
      tap(() => this.checkAuthStatus().subscribe())
    );
  }

  changePassword(data: any): Observable<any> {
    return this.http.post<any>(`${this._baseUrl}/change-password`, data, { withCredentials: true });
  }

  getSessions(): Observable<any[]> {
    return this.http.get<any[]>(`${this._baseUrl}/sessions`, { withCredentials: true });
  }

  revokeSession(sessionId: string): Observable<void> {
    return this.http.post<void>(`${this._baseUrl}/sessions/${sessionId}/revoke`, {}, { withCredentials: true });
  }

  generateMfaSecret(): Observable<{ secret: string; qrCodeUrl: string }> {
    return this.http.post<{ secret: string; qrCodeUrl: string }>(`${this._baseUrl}/2fa/generate`, {}, { withCredentials: true });
  }

  enableMfa(token: string): Observable<{ success: boolean; backupCodes: string[] }> {
    return this.http.post<{ success: boolean; backupCodes: string[] }>(`${this._baseUrl}/2fa/enable`, { token }, { withCredentials: true });
  }

  disableMfa(): Observable<void> {
    return this.http.post<void>(`${this._baseUrl}/2fa/disable`, {}, { withCredentials: true });
  }

  generateBackupCodes(): Observable<string[]> {
    return this.http.post<string[]>(`${this._baseUrl}/2fa/backup-codes/generate`, {}, { withCredentials: true });
  }

  getOnboardingStatus(): Observable<{ step: string; isCompleted: boolean }> {
    return this.http.get<{ step: string; isCompleted: boolean }>(`${this._baseUrl}/onboarding-status`, { withCredentials: true });
  }
}
