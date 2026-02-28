import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonComponent, InputComponent } from '@virteex/shared-ui';

@Component({
  selector: 'virteex-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent, InputComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  forgotForm: FormGroup;
  verificationForm: FormGroup;

  loading = false;
  errorMsg = '';
  successMsg = '';

  step = 1; // 1: Input, 2: Verification (Code), 3: Review/Success
  riskLevel = 'low'; // low, medium, high

  lang = 'es';
  country = 'CO';

  constructor() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.verificationForm = this.fb.group({
        code: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
      this.route.paramMap.subscribe(params => {
          this.lang = params.get('lang') || 'es';
          this.country = params.get('country') || 'CO';
      });
  }

  onSubmitEmail() {
      if (this.forgotForm.valid) {
          this.loading = true;
          this.errorMsg = '';

          // Simulate risk-based logic described in document
          setTimeout(() => {
              this.loading = false;
              const email = this.forgotForm.value.email as string;

              if (email.includes('admin')) {
                  // High Risk -> Human verification
                  this.riskLevel = 'high';
                  this.step = 3;
              } else if (email.includes('manager')) {
                  // Medium Risk -> MFA Code required
                  this.riskLevel = 'medium';
                  this.step = 2;
              } else {
                  // Low Risk -> Email link
                  this.riskLevel = 'low';
                  this.step = 3;
                  this.successMsg = 'Se ha enviado un enlace de recuperación a tu correo.';
              }
          }, 1500);
      }
  }

  onSubmitCode() {
      if (this.verificationForm.valid) {
          this.loading = true;
          setTimeout(() => {
              this.loading = false;
              this.step = 3;
              this.successMsg = 'Código verificado. Puedes restablecer tu contraseña.';
              // Redirect to reset password page...
          }, 1500);
      }
  }
}
