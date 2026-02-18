import { Injectable, signal, inject, computed, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TokenService } from './token.service';
import { API_URL } from '@virteex/shared-config';
import { firstValueFrom } from 'rxjs';

export interface User {
  id: string;
  email: string;
  role: string;
  companyId: string;
  country?: string;
  sessionId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private tokenService = inject(TokenService);
  private http = inject(HttpClient);

  private _user = signal<User | null>(null);
  public user = this._user.asReadonly();
  public isLoggedIn = computed(() => !!this._user());

  constructor(@Inject(API_URL) private apiUrl: string) {
    this.restoreSession();
  }

  login(): void {
    this.restoreSession();
  }

  logout(): void {
    // Call backend to clear cookies
    this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe();
    this._user.set(null);
  }

  private async restoreSession(): Promise<void> {
    try {
      // Validate with backend and get user info
      const user = await firstValueFrom(this.http.get<User>(`${this.apiUrl}/auth/me`));
      this._user.set(user);
    } catch (e) {
      console.error('No active session', e);
      this._user.set(null);
    }
  }
}
