import { APP_CONFIG } from '@virteex/shared-config';
import { Component, inject, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module, ReCaptchaV3Service } from 'ng-recaptcha-19';
import { RECAPTCHA_SITE_KEY } from '@virteex/shared-ui';
import { switchMap } from 'rxjs';

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
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useExisting: RECAPTCHA_SITE_KEY
    }
  ],
  templateUrl: './forgot-password.page.html'
})
export class ForgotPasswordPage {
  private config: any = inject(APP_CONFIG, { optional: true });
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private recaptchaV3Service = inject(ReCaptchaV3Service);
  private translate = inject(TranslateService);
  public languageService = inject(LanguageService);

  constructor() {
    effect(() => {
      this.translate.use(this.languageService.currentLang());
    });
  }

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

    this.recaptchaV3Service.execute('forgotPassword').subscribe({
      next: (recaptchaToken) => {
        const email = this.forgotPasswordForm.value.email!;
        this.authService.forgotPassword(email, recaptchaToken).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.successMessage.set('FORGOT_PASSWORD.SUCCESS'); // Will be translated in template
            this.forgotPasswordForm.reset();
          },
          error: () => {
            this.isLoading.set(false);
            this.errorMessage.set('LOGIN.ERRORS.SERVER_ERROR');
          }
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('LOGIN.ERRORS.SERVER_ERROR');
      }
    });
  }
}
