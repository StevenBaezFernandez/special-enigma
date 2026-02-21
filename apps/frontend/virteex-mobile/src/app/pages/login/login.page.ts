import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '@virteex/shared-config';
import { SessionService } from '@virteex/shared-util-auth';

@Component({
  selector: 'virteex-mobile-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private sessionService = inject(SessionService);

  constructor(@Inject(API_URL) private apiUrl: string) {}

  isLoading = false;
  errorMessage: string | null = null;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;

      try {
        const { email, password } = this.loginForm.value;

        // Real implementation: Call Identity Service via Gateway/API
        // This sets the HttpOnly cookie for the session
        await firstValueFrom(this.http.post(`${this.apiUrl}/auth/login`, { email, password, rememberMe: true }));

        // Refresh session state in the client
        this.sessionService.login();

        console.log('Login successful for:', email);

        // Determine offline/online status to show capabilities
        if (!navigator.onLine) {
            console.log('Logging in offline mode (cached credentials check would go here)');
        }

        // Navigate to dashboard
        this.router.navigate(['/dashboard']);

      } catch (error) {
        console.error('Login failed', error);
        this.errorMessage = 'Invalid credentials or network error.';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
