import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpContext, HttpContextToken } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  map,
  tap,
  throwError,
  of,
  take,
  firstValueFrom,
} from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

// Relative imports
import { API_URL } from '@virteex/shared-config';
import { RegisterPayload } from '../../interfaces/register-payload.interface';
import { User } from '../../interfaces/user.interface';
import { UserStatus } from '../../enums/user-status.enum';
import { NotificationService } from './notification'; // Changed to notification.ts
import { WebSocketService } from './websocket.service';
import { ErrorHandlerService } from './error-handler.service';
import { hasPermission } from '@virteex/shared-util-auth';

// Enums
export enum AuthStatus {
  pending = 'pending',
  authenticated = 'authenticated',
  unauthenticated = 'unauthenticated'
}

// Token
export const IS_PUBLIC_API = new HttpContextToken<boolean>(() => false);

// Interfaces
export interface LoginCredentials {
  email: string;
  password?: string;
  recaptchaToken?: string;
}

export interface UserPayload {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    status?: UserStatus;
}

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
}

interface TwoFactorRequiredResponse {
  require2fa: boolean;
  tempToken: string;
  message: string;
}

type LoginResult = LoginResponse | TwoFactorRequiredResponse;

function isTwoFactorRequired(res: LoginResult): res is TwoFactorRequiredResponse {
    return (res as TwoFactorRequiredResponse).require2fa === true;
}

// Default ModalService if missing, or use any
@Injectable({ providedIn: 'root' })
export class ModalService {
    open(args: any): any { return { onClose$: of(true) }; }
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private webSocketService = inject(WebSocketService);
  private errorHandlerService = inject(ErrorHandlerService);
  private readonly baseUrl = inject(API_URL);

  private readonly apiUrl = `${this.baseUrl}/auth`;

  private _currentUser = signal<User | null>(null);
  private _authStatus = signal<AuthStatus>(AuthStatus.pending);

  public readonly currentUser = computed(() => this._currentUser());
  public readonly authStatus = computed(() => this._authStatus());
  public readonly isAuthenticated = computed(
    () => this._authStatus() === AuthStatus.authenticated
  );

  public isAuthenticated$ = toObservable(this.isAuthenticated);
  public user$ = toObservable(this.currentUser);

  constructor(private modalService: ModalService) {
    this.listenForForcedLogout();
  }

  private listenForForcedLogout(): void {
    this.webSocketService.connectionReady$.pipe(take(1)).subscribe(() => {
      this.webSocketService
        .listen<{ reason: string }>('force-logout')
        .subscribe((data) => {
          this.logout();
          this.modalService
            .open({
              title: 'Sesión Terminada',
              message: data.reason,
              confirmText: 'Aceptar',
            })
            ?.onClose$.subscribe(() => {});
        });
    });
  }

  hasPermissions(requiredPermissions: string[]): boolean {
    const user = this.currentUser();
    return hasPermission(user?.permissions, requiredPermissions);
  }

  refreshAccessToken(): Observable<LoginResponse> {
    return this.http
      .get<LoginResponse>(`${this.apiUrl}/refresh`, {
        withCredentials: true,
        context: new HttpContext().set(IS_PUBLIC_API, true)
      })
      .pipe(
        tap((response) => {
          if (response && response.user && response.accessToken) {
            this._currentUser.set(response.user);
            this._authStatus.set(AuthStatus.authenticated);
          }
        })
      );
  }

  login(credentials: LoginCredentials): Observable<User | { require2fa: boolean; tempToken: string }> {
    const url = `${this.apiUrl}/login`;
    return this.http
      .post<LoginResult>(url, credentials, {
        withCredentials: true,
        context: new HttpContext().set(IS_PUBLIC_API, true)
      })
      .pipe(
        tap((response) => {
          if (isTwoFactorRequired(response)) {
             return;
          }
          if (response.user) {
             this._currentUser.set(response.user);
             this._authStatus.set(AuthStatus.authenticated);

             this.webSocketService.connect();
             this.webSocketService.emit('user-status', { isOnline: true });
             this.listenForForcedLogout();
          }
        }),
        map((response) => {
            if (isTwoFactorRequired(response)) {
                return { require2fa: true, tempToken: response.tempToken };
            }
            const { accessToken, ...safeResponse } = response;
            return safeResponse.user;
        }),
        catchError((err) => this.errorHandlerService.handleError('login', err))
      );
  }

  verify2fa(code: string, tempToken: string): Observable<User> {
      return this.http.post<LoginResponse>(`${this.apiUrl}/verify-2fa`, { code, tempToken }, {
          withCredentials: true,
          context: new HttpContext().set(IS_PUBLIC_API, true)
      }).pipe(
          tap((response) => {
             this._currentUser.set(response.user);
             this._authStatus.set(AuthStatus.authenticated);

             this.webSocketService.connect();
             this.webSocketService.emit('user-status', { isOnline: true });
             this.listenForForcedLogout();
          }),
          map((response) => response.user),
          catchError((err) => this.errorHandlerService.handleError('verify2fa', err))
      );
  }

  sendPhoneOtp(phoneNumber: string): Observable<{ message: string }> {
      return this.http.post<{ message: string }>(`${this.apiUrl}/send-phone-otp`, { phoneNumber });
  }

  verifyPhoneOtp(code: string, phoneNumber: string): Observable<{ message: string }> {
      return this.http.post<{ message: string }>(`${this.apiUrl}/verify-phone`, { code, phoneNumber });
  }

  enable2fa(token: string): Observable<any> {
      return this.http.post(`${this.apiUrl}/2fa/enable`, { token });
  }

  disable2fa(): Observable<any> {
      return this.http.post(`${this.apiUrl}/2fa/disable`, {});
  }

  checkAuthStatus(): Observable<boolean> {
    const url = `${this.apiUrl}/status`;
    this._authStatus.set(AuthStatus.pending);
    return this.http.get<{ isAuthenticated: boolean; user: User | null }>(url, {
      withCredentials: true,
      context: new HttpContext().set(IS_PUBLIC_API, true)
    }).pipe(
      map((res) => {
        if (res.isAuthenticated && res.user) {
          this._currentUser.set(res.user);
          this._authStatus.set(AuthStatus.authenticated);
          this.webSocketService.connect();
          this.webSocketService.emit('user-status', { isOnline: true });
          this.listenForForcedLogout();
          return true;
        } else {
          this._currentUser.set(null);
          this._authStatus.set(AuthStatus.unauthenticated);
          this.webSocketService.disconnect();
          return false;
        }
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 || err.status === 403) {
            this._currentUser.set(null);
            this._authStatus.set(AuthStatus.unauthenticated);
            this.webSocketService.disconnect();
            return of(false);
        } else {
            this._currentUser.set(null);
            this._authStatus.set(AuthStatus.unauthenticated);
             this.webSocketService.disconnect();
            return of(false);
        }
      })
    );
  }

  getSocialRegisterInfo(token: string): Observable<any> {
      return this.http.get(`${this.apiUrl}/social-register-info?token=${token}`, {
          context: new HttpContext().set(IS_PUBLIC_API, true)
      });
  }

  getPermissions$(): Observable<string[]> {
    return this.user$.pipe(map((user) => user?.permissions || []));
  }

  register(payload: RegisterPayload): Observable<User> {
    const url = `${this.apiUrl}/register`;
    return this.http
      .post<{ user: User }>(url, payload, {
        withCredentials: true,
        context: new HttpContext().set(IS_PUBLIC_API, true)
      })
      .pipe(
        map((response) => response.user),
        tap((user) => {
          this._currentUser.set(user);
          this._authStatus.set(AuthStatus.authenticated);
          this.router.navigate(['/dashboard']);
        }),
        catchError((err) => this.errorHandlerService.handleError('register', err))
      );
  }

  logout(notifyBackend = true): void {
    this._currentUser.set(null);
    this._authStatus.set(AuthStatus.unauthenticated);
    this.webSocketService.emit('user-status', { isOnline: false });
    this.webSocketService.disconnect();
    this.router.navigate(['/auth/login']);

    if (notifyBackend) {
      const url = `${this.apiUrl}/logout`;
      this.http.post(url, {}, {
        withCredentials: true,
        context: new HttpContext().set(IS_PUBLIC_API, true)
      }).pipe(
        catchError(() => of(null))
      ).subscribe();
    }
  }

  async registerPasskey(): Promise<void> {
    try {
      const options = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/webauthn/register/options`));
      const credential = await startRegistration(options);
      await firstValueFrom(this.http.post(`${this.apiUrl}/webauthn/register/verify`, credential));
      this.notificationService.showSuccess('Llave de acceso registrada correctamente');
    } catch (error) {
      this.notificationService.showError('Error al registrar la llave de acceso');
      throw error;
    }
  }

  async loginWithPasskey(email?: string): Promise<User | null> {
    try {
      const options = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/webauthn/login/options`, { email }, {
          context: new HttpContext().set(IS_PUBLIC_API, true)
      }));
      const credential = await startAuthentication(options);
      const body = {
        credential,
        challengeId: options.challengeId
      };
      const response = await firstValueFrom(this.http.post<LoginResponse>(`${this.apiUrl}/webauthn/login/verify`, body, {
          withCredentials: true,
          context: new HttpContext().set(IS_PUBLIC_API, true)
      }));

      if (response.user) {
        this._currentUser.set(response.user);
        this._authStatus.set(AuthStatus.authenticated);
        this.webSocketService.connect();
        this.webSocketService.emit('user-status', { isOnline: true });
        this.listenForForcedLogout();
      }
      return response.user;
    } catch (error) {
      this.notificationService.showError('Error al iniciar sesión con llave de acceso');
      throw error;
    }
  }

  forgotPassword(email: string, recaptchaToken: string): Observable<{ message: string }> {
    const url = `${this.apiUrl}/forgot-password`;
    return this.http
      .post<{ message: string }>(url, { email, recaptchaToken }, {
        context: new HttpContext().set(IS_PUBLIC_API, true)
      })
      .pipe(catchError((err) => this.errorHandlerService.handleError('forgotPassword', err)));
  }

  resetPassword(token: string, password: string): Observable<User> {
    const url = `${this.apiUrl}/reset-password`;
    return this.http
      .post<User>(url, { token, password }, {
        context: new HttpContext().set(IS_PUBLIC_API, true)
      })
      .pipe(catchError((err) => this.errorHandlerService.handleError('resetPassword', err)));
  }

  setPasswordFromInvitation(token: string, password: string): Observable<LoginResponse> {
    const url = `${this.apiUrl}/set-password-from-invitation`;
    return this.http
      .post<LoginResponse>(url, { token, password }, {
        withCredentials: true,
        context: new HttpContext().set(IS_PUBLIC_API, true)
      })
      .pipe(
        tap((response) => {
          this._currentUser.set(response.user);
          this._authStatus.set(AuthStatus.authenticated);
        }),
        catchError((err) => this.errorHandlerService.handleError('setPasswordFromInvitation', err))
      );
  }

  getInvitationDetails(token: string): Observable<{ firstName: string }> {
    const url = `${this.apiUrl}/invitation/${token}`;
    return this.http
      .get<{ firstName: string }>(url, {
        context: new HttpContext().set(IS_PUBLIC_API, true)
      })
      .pipe(catchError((err) => this.errorHandlerService.handleError('getInvitationDetails', err)));
  }

  inviteUser(payload: UserPayload): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/invite`, payload);
  }

  updateUser(id: string, payload: UserPayload): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, payload);
  }

  updateUserStatus(id: string, status: UserStatus): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  impersonate(userId: string): Observable<User> {
    return this.http
      .post<{ user: User }>(
        `${this.apiUrl}/impersonate`,
        { userId },
        { withCredentials: true }
      )
      .pipe(
        tap((response) => {
          this._currentUser.set(response.user);
          this._authStatus.set(AuthStatus.authenticated);
          this.notificationService.showSuccess(
            `Ahora estás viendo como ${response.user.firstName}`
          );
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/dashboard']);
          });
        }),
        map((response) => response.user),
        catchError((err) => this.errorHandlerService.handleError('impersonate', err))
      );
  }

  stopImpersonation(): Observable<User> {
    return this.http
      .post<{ user: User }>(
        `${this.apiUrl}/stop-impersonation`,
        {},
        { withCredentials: true }
      )
      .pipe(
        tap((response) => {
          this._currentUser.set(response.user);
          this._authStatus.set(AuthStatus.authenticated);
          this.notificationService.showSuccess(
            'Has vuelto a tu cuenta original.'
          );
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/dashboard']);
          });
        }),
        map((response) => response.user),
        catchError((err) => this.errorHandlerService.handleError('stopImpersonation', err))
      );
  }

  changePassword(data: any): Observable<{ message: string }> {
      return this.http.post<{ message: string }>(`${this.apiUrl}/change-password`, data, {
          context: new HttpContext().set(IS_PUBLIC_API, true)
      }).pipe(
          catchError((err) => this.errorHandlerService.handleError('changePassword', err))
      );
  }
}
