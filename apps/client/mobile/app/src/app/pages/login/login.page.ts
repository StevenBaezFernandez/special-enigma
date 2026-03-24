import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '@virteex/shared-config';
import { SessionService } from '@virteex/shared-util-auth';
import { SecureStorageService } from '@virteex/shared-util-auth';

@Component({
  selector: 'virteex-mobile-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.page.html',
})
export class LoginPage implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private secureStorage = inject(SecureStorageService);

  constructor(@Inject(API_URL) private apiUrl: string) {}

  isLoading = false;
  errorMessage: string | null = null;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(12)]],
  });

  async ngOnInit() {
    // Check for existing session
    try {
        const token = await this.secureStorage.get('access_token');
        if (token) {
            // Validate expiry locally
            if (this.isTokenValid(token)) {
                if (!navigator.onLine) {
                    console.log('Offline: Found valid cached token, proceeding.');
                    this.sessionService.login();
                    this.router.navigate(['/dashboard']);
                }
                // If online, usually interceptors handle 401s, but we could also auto-login here.
            } else {
                console.log('Cached token expired or invalid.');
                // Optionally clear it
                await this.secureStorage.remove('access_token');
            }
        }
    } catch (e) {
        console.error('Error checking cached token', e);
    }
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      const { email, password } = this.loginForm.value;

      try {
        if (navigator.onLine) {
            // Online Login
            const res: any = await firstValueFrom(this.http.post(`${this.apiUrl}/auth/login`, { email, password, rememberMe: true }));

            // Save tokens securely
            if (res.accessToken) {
                await this.secureStorage.set('access_token', res.accessToken);
            }
            if (res.refreshToken) {
                await this.secureStorage.set('refresh_token', res.refreshToken);
            }

            this.sessionService.login();
            this.router.navigate(['/dashboard']);

        } else {
             // Offline: Check if we have a valid token
             const token = await this.secureStorage.get('access_token');
             if (token && this.isTokenValid(token)) {
                 console.log('Offline login via valid cached token.');
                 this.sessionService.login();
                 this.router.navigate(['/dashboard']);
             } else {
                 this.errorMessage = 'Offline login failed. No valid session found. Please connect to internet.';
             }
        }

      } catch (error: any) {
        console.error('Login failed', error);
        this.errorMessage = error.message || 'Invalid credentials or network error.';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  private isTokenValid(token: string): boolean {
      try {
          const payloadPart = token.split('.')[1];
          const payload = JSON.parse(atob(payloadPart));
          if (!payload.exp) return false;

          // Check expiry (exp is in seconds)
          return Date.now() < payload.exp * 1000;
      } catch (e) {
          return false;
      }
  }
}
