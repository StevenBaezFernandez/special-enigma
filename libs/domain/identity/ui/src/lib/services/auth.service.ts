import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginUserDto, RegisterUserDto, LoginResponseDto, VerifyMfaDto, InitiateSignupDto, VerifySignupDto, CompleteOnboardingDto } from '@virteex/domain-identity-contracts';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/auth';
  private http = inject(HttpClient);

  login(dto: LoginUserDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.apiUrl}/login`, dto);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register(dto: RegisterUserDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, dto);
  }

  verifyMfa(dto: VerifyMfaDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.apiUrl}/verify-mfa`, dto);
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
