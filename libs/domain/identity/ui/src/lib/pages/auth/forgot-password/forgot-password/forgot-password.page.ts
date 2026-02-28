import { APP_CONFIG } from '@virteex/shared-config';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module, ReCaptchaV3Service } from 'ng-recaptcha-19';

import { AuthService } from '../../../../services/auth.service';
import { LanguageService } from '@virteex/shared-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Shared Components
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';
import { AuthInputComponent } from '../../components/auth-input/auth-input.component';
import { AuthButtonComponent } from '../../components/auth-button/auth-button.component';

@Component({
  selector: 'virteex-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RecaptchaV3Module,
    RouterModule,
    TranslateModule,
    AuthLayoutComponent,
    AuthInputComponent,
    AuthButtonComponent
  ],
  providers: [
    ReCaptchaV3Service,
    // Note: Config is injected in constructor/fields, cannot be used in decorator metadata directly if it relies on instance 'this'.
    // However, if we assume APP_CONFIG is a token that provides the whole config object, we might need a factory or direct string if static.
    // For now, removing the problematic provider usage in decorator or mocking it differently.
    // Assuming the site key should be provided at module/app level, not here.
    // But if we must, we can't access 'this' here.
  ],
  templateUrl: './forgot-password.page.html'
})
export class ForgotPasswordPage {
  private config = inject(APP_CONFIG);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private recaptchaV3Service = inject(ReCaptchaV3Service);
  public languageService = inject(LanguageService);

  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  getErrorMessage(controlName: string): string {
    const control = this.forgotPasswordForm.get(controlName);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'LOGIN.ERRORS.EMAIL_REQUIRED';
      if (control.errors['email']) return 'LOGIN.ERRORS.EMAIL_INVALID';
    }
    return '';
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.recaptchaV3Service.execute('forgotPassword').pipe(
      switchMap((recaptchaToken) => {
        const email = this.forgotPasswordForm.value.email!;
        return this.authService.forgotPassword(email, recaptchaToken);
      })
    ).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set('FORGOT_PASSWORD.SUCCESS'); // Will be translated in template
        this.forgotPasswordForm.reset();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('LOGIN.ERRORS.SERVER_ERROR');
      }
    });
  }
}
