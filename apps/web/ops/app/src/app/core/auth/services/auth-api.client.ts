import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../config/api-base-url.token';

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiClient {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  login(credentials: { email: string; password?: string }): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.apiBaseUrl}/auth/login`, credentials);
  }
}
