import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'virteex-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-box">
        <h2>Virteex Ops Login</h2>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email">
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password">
          </div>
          <button type="submit" [disabled]="loginForm.invalid">Login</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f7fafc;
    }
    .login-box {
      padding: 40px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      width: 400px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 8px;
    }
    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
    }
    button {
      width: 100%;
      padding: 10px;
      background-color: #4299e1;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:disabled {
      background-color: #cbd5e0;
    }
  `]
})
export class LoginComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      if (email && password) {
        this.authService.login({ email, password }).subscribe();
      }
    }
  }
}
