import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  // We no longer store tokens in LocalStorage for security (HttpOnly Cookies are used)

  setTokens(accessToken: string, refreshToken?: string): void {
    // No-op
  }

  getAccessToken(): string | null {
    return null;
  }

  getRefreshToken(): string | null {
    return null;
  }

  clearTokens(): void {
    // No-op
  }

  hasAccessToken(): boolean {
    // We assume true if we have a session, but really we rely on API calls now
    return false;
  }
}
