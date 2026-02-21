import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  // Access Token is stored in memory for security (XSS protection vs LocalStorage)
  // Refresh Token is stored in HttpOnly Cookie (handled by browser)
  private accessToken: string | null = null;

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Legacy/Shim methods to maintain compatibility if called elsewhere
  setTokens(accessToken: string, refreshToken?: string): void {
    this.setAccessToken(accessToken);
  }

  getRefreshToken(): string | null {
    return null; // Not accessible to JS
  }

  clearTokens(): void {
    this.accessToken = null;
  }

  hasAccessToken(): boolean {
    return !!this.accessToken;
  }
}
