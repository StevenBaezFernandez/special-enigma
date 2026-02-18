import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent, InputComponent } from '@virteex/shared-ui';
import { CountrySelectorComponent } from '../../components/country-selector/country-selector.component';
import { SessionService } from '@virteex/shared-util-auth';

@Component({
  selector: 'virteex-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent, CountrySelectorComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);
  public router = inject(Router);
  private route = inject(ActivatedRoute);

  registerForm: FormGroup;
  loading = false;
  errorMsg = '';
  country = 'CO';
  currentStep = 1;
  onboardingToken = '';

  constructor() {
    this.registerForm = this.fb.group({
      // Step 1
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(12)]],
      confirmPassword: ['', Validators.required],

      // Step 2
      otp: ['', [Validators.minLength(6), Validators.maxLength(6)]],

      // Step 3
      companyName: ['', Validators.required],
      industry: ['', Validators.required],
      country: ['CO', Validators.required],
      taxId: ['', Validators.required],
      regime: ['', Validators.required],
      terms: [false, Validators.requiredTrue],
      privacy: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
        const countryParam = params.get('country');
        if (countryParam) {
            this.country = countryParam.toUpperCase();
            this.registerForm.patchValue({ country: this.country });
            this.updateValidators(this.country);
        }
    });
  }

  onCountrySelected(country: string) {
    this.country = country;
    this.registerForm.patchValue({ country });
    this.updateValidators(country);
  }

  updateValidators(country: string) {
      const taxIdControl = this.registerForm.get('taxId');
      taxIdControl?.clearValidators();
      taxIdControl?.setValidators(Validators.required);

      if (country === 'CO') {
          taxIdControl?.addValidators(Validators.pattern(/^\d{9,10}$/));
      } else if (country === 'MX') {
          taxIdControl?.addValidators(Validators.pattern(/^[A-Z&Ñ]{3,4}\d{6}[A-V1-9][A-Z\d]{2}$/));
      } else if (country === 'US') {
          taxIdControl?.addValidators(Validators.pattern(/^\d{2}-\d{7}$|^\d{3}-\d{2}-\d{4}$/));
      }
      taxIdControl?.updateValueAndValidity();
  }

  passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
      return g.get('password')?.value === g.get('confirmPassword')?.value
         ? null : { mismatch: true };
  }

  isStep1Valid(): boolean {
      const { firstName, lastName, email, phone, password, confirmPassword } = this.registerForm.controls;
      return firstName.valid && lastName.valid && email.valid && phone.valid && password.valid && confirmPassword.valid && !this.registerForm.hasError('mismatch');
  }

  get passwordStrengthLabel(): string {
      const val = this.registerForm.get('password')?.value || '';
      if (val.length < 8) return 'Débil';
      if (val.length < 12) return 'Media';
      return 'Fuerte';
  }

  get passwordStrengthWidth(): string {
      const val = this.registerForm.get('password')?.value || '';
      if (val.length < 8) return '30%';
      if (val.length < 12) return '60%';
      return '100%';
  }

  get passwordStrengthClass(): string {
      const val = this.registerForm.get('password')?.value || '';
      if (val.length < 8) return 'bg-red-500';
      if (val.length < 12) return 'bg-yellow-500';
      return 'bg-green-500';
  }

  getTaxIdLabel(): string {
    const labels: Record<string, string> = { 'CO': 'NIT', 'MX': 'RFC', 'US': 'EIN/SSN' };
    return labels[this.country] || 'Tax ID';
  }

  getTaxIdPlaceholder(): string {
     const placeholders: Record<string, string> = { 'CO': '900123456', 'MX': 'ABC123456...', 'US': '12-3456789' };
     return placeholders[this.country] || '';
  }

  onInitiateSignup() {
      if (this.isStep1Valid()) {
          this.loading = true;
          this.errorMsg = '';
          const { email, password } = this.registerForm.value;
          this.authService.initiateSignup({ email, password }).subscribe({
              next: () => {
                  this.loading = false;
                  this.currentStep = 2;
              },
              error: (err: any) => {
                  this.loading = false;
                  this.errorMsg = err.error?.message || 'Error al iniciar registro.';
              }
          });
      }
  }

  onVerifySignup() {
      if (this.registerForm.get('otp')?.valid) {
          this.loading = true;
          this.errorMsg = '';
          const { email, otp } = this.registerForm.value;
          this.authService.verifySignup({ email, otp }).subscribe({
              next: (res: any) => {
                  this.loading = false;
                  this.onboardingToken = res.onboardingToken;
                  this.currentStep = 3;
              },
              error: (err: any) => {
                  this.loading = false;
                  this.errorMsg = 'Código inválido.';
              }
          });
      }
  }

  onSubmit() {
    if (this.registerForm.valid && this.onboardingToken) {
      this.loading = true;
      this.errorMsg = '';
      const payload = {
          ...this.registerForm.value,
          onboardingToken: this.onboardingToken
      };

      this.authService.completeOnboarding(payload).subscribe({
        next: (res) => {
          this.currentStep = 4;
          this.loading = false;
          this.sessionService.login(); // Update frontend state
          setTimeout(() => {
              this.router.navigate(['/']);
          }, 2000);
        },
        error: (err: any) => {
          this.loading = false;
          this.errorMsg = err.error?.message || 'Error en el registro.';
        }
      });
    }
  }
}
