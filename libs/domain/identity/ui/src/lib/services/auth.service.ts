import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, lastValueFrom, tap } from 'rxjs';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { LoginUserDto, RegisterUserDto, LoginResponseDto, VerifyMfaDto, InitiateSignupDto, VerifySignupDto, CompleteOnboardingDto } from '@virteex/domain-identity-contracts';
import { SessionService } from '@virteex/shared-util-client-auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/auth';
  private http = inject(HttpClient);
  private sessionService = inject(SessionService);

  login(dto: LoginUserDto & { recaptchaToken?: string }): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.apiUrl}/login`, dto).pipe(
      tap(() => this.sessionService.login())
    );
  }

  verifyMfa(dto: VerifyMfaDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.apiUrl}/verify-mfa`, dto).pipe(
      tap(() => this.sessionService.login())
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forgotPassword(email: string, recaptchaToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email, recaptchaToken });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, password });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setPasswordFromInvitation(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/set-password`, { token, password });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSocialRegisterInfo(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/social-register-info?token=${token}`);
  }

  async registerPasskey(): Promise<any> {
    const options = await lastValueFrom(this.http.get<any>(`${this.apiUrl}/passkey/register-options`));
    const attResp = await startRegistration({ optionsJSON: options });
    return lastValueFrom(this.http.post(`${this.apiUrl}/passkey/register-verify`, attResp));
  }

  async loginWithPasskey(email?: string): Promise<any> {
    const options = await lastValueFrom(this.http.post<any>(`${this.apiUrl}/passkey/login-options`, { email }));
    const asseResp = await startAuthentication({ optionsJSON: options });
    return lastValueFrom(this.http.post(`${this.apiUrl}/passkey/login-verify`, asseResp));
  }

  initiateSignup(dto: InitiateSignupDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup/initiate`, dto);
  }

  verifySignup(dto: VerifySignupDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup/verify`, dto);
  }

  completeOnboarding(dto: CompleteOnboardingDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup/complete`, dto).pipe(
      tap(() => this.sessionService.login())
    );
  }
}
