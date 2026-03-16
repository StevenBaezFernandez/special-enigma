import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginUserDto, RegisterUserDto, LoginResponseDto, VerifyMfaDto, InitiateSignupDto, VerifySignupDto, CompleteOnboardingDto } from '@virteex/domain-identity-contracts';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/auth';
  private http = inject(HttpClient);

  login(dto: LoginUserDto & { recaptchaToken?: string }): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.apiUrl}/login`, dto);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register(dto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, dto);
  }

  verifyMfa(dto: VerifyMfaDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.apiUrl}/verify-mfa`, dto);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loginWithPasskey(email?: string): Promise<any> {
    return Promise.resolve({ id: 'mock-user-id' });
  }

  verify2fa(code: string, tempToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-2fa`, { code, tempToken });
  }

  initiateSignup(dto: InitiateSignupDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup/initiate`, dto);
  }

  verifySignup(dto: VerifySignupDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup/verify`, dto);
  }

  completeOnboarding(dto: CompleteOnboardingDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup/complete`, dto);
  }
}
