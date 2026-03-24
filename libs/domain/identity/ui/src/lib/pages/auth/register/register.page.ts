import { Component, OnInit, inject, signal, effect, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LucideAngularModule, CheckCircle, BarChart2, Package, Check, ArrowLeft, ArrowRight, Rocket, AlertCircle } from 'lucide-angular';
import { trigger, style, transition, animate } from '@angular/animations';
import { AuthService } from '@virteex/shared-ui';
import { StepAccountInfo } from './steps/step-account-info/step-account-info';
import { StepBusiness } from './steps/step-business/step-business';
import { StepConfiguration } from './steps/step-configuration/step-configuration';
import { StepPlan } from './steps/step-plan/step-plan';
import { strongPasswordValidator } from '@virteex/shared-ui';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module, ReCaptchaV3Service } from 'ng-recaptcha-19';
import { CountryService, LanguageService, OtpComponent, RECAPTCHA_SITE_KEY } from '@virteex/shared-ui';
import { AuthLayoutComponent } from '../components/auth-layout/auth-layout.component';
import { AuthButtonComponent } from '../components/auth-button/auth-button.component';

// Validador personalizado para coincidencia de contraseñas
export function passwordMatchValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'virteex-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    LucideAngularModule,
    RouterLink,
    StepAccountInfo,
    StepBusiness,
    StepConfiguration,
    StepPlan,
    RecaptchaV3Module,
    AuthLayoutComponent,
    AuthButtonComponent,
    OtpComponent
  ],
  providers: [
    ReCaptchaV3Service,
    {
        provide: RECAPTCHA_V3_SITE_KEY,
        useExisting: RECAPTCHA_SITE_KEY
    }
  ],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  animations: [
    trigger('stepAnimation', [
      transition(':increment', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 }),
        ),
      ]),
      transition(':decrement', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 }),
        ),
      ]),
    ]),
  ],
})
export class RegisterPage implements OnInit {
  // Iconos
  protected readonly CheckCircleIcon = CheckCircle;
  protected readonly BarChart2Icon = BarChart2;
  protected readonly PackageIcon = Package;
  protected readonly CheckIcon = Check;
  protected readonly ArrowLeftIcon = ArrowLeft;
  protected readonly ArrowRightIcon = ArrowRight;
  protected readonly RocketIcon = Rocket;
  protected readonly AlertCircleIcon = AlertCircle;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private recaptchaV3Service = inject(ReCaptchaV3Service);
  private translate = inject(TranslateService);
  public countryService = inject(CountryService);
  public languageService = inject(LanguageService);

  currentStep = signal(1);
  registerForm!: FormGroup;
  errorMessage = signal<string | null>(null);
  isRegistering = signal(false);
  stepsCompleted = signal<boolean[]>(new Array(5).fill(false));
  onboardingToken = signal<string | null>(null);

  // Configuración reactiva basada en el país
  currentCountryConfig = computed(() => this.countryService.currentCountry());

  constructor() {
    effect(() => {
      this.translate.use(this.languageService.currentLang());
    });

    effect(() => {
      const config = this.currentCountryConfig();
      if (config && this.registerForm) {
        const taxIdControl = this.registerForm.get('configuration.taxId');
        if (taxIdControl) {
          const pattern = config.taxIdRegex || '^[A-Za-z0-9\\-\\s]+$';
          taxIdControl.setValidators([
            Validators.required,
            Validators.pattern(pattern),
          ]);
          taxIdControl.updateValueAndValidity();
        }

        const currencyControl = this.registerForm.get('configuration.currency');
        if (currencyControl) {
          currencyControl.setValue(config.currencyCode);
        }

        const fiscalRegionIdControl = this.registerForm.get(
          'configuration.fiscalRegionId',
        );
        if (fiscalRegionIdControl) {
          if (config.fiscalRegionId) {
            fiscalRegionIdControl.setValue(config.fiscalRegionId);
          } else {
            fiscalRegionIdControl.setValue(null);
          }
        }
      }
    });

    effect(() => {
      const code = this.countryService.currentCountryCode();
      if (code && this.registerForm) {
        const countryControl = this.registerForm.get('configuration.country');
        if (countryControl && countryControl.value !== code.toUpperCase()) {
          countryControl.setValue(code.toUpperCase(), { emitEvent: false });
        }
      }
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe(params => {
      const lang = params.get('lang');
      if (lang) {
        this.languageService.setLanguage(lang);
      }
    });

    const routeCountry = this.activatedRoute.parent?.parent?.snapshot.paramMap.get('country') ||
                         this.activatedRoute.parent?.snapshot.paramMap.get('country');

    if (!routeCountry) {
      this.countryService.detectAndSetCountry();
    }

    this.registerForm = this.fb.group({
      fax: [''], // Honeypot antispam
      // Paso 1: Información de Cuenta
      accountInfo: this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        jobTitle: [''],
        phone: [''],
        avatarUrl: [null],
        passwordGroup: this.fb.group(
          {
            password: [
              '',
              [
                Validators.required,
                Validators.minLength(12),
                strongPasswordValidator(),
              ],
            ],
            confirmPassword: ['', [Validators.required]],
          },
          { validators: passwordMatchValidator },
        ),
      }),
      // Step 2: OTP (Dynamic Step)
      otp: ['', [Validators.minLength(6), Validators.maxLength(6)]],
      // Paso 3: Configuración Fiscal (Dinámica)
      configuration: this.fb.group({
        country: ['DO', [Validators.required]],
        taxId: ['', [Validators.required]],
        fiscalRegionId: [null], // Se llena automáticamente vía Effect
        currency: ['DOP', [Validators.required]],
      }),
      // Paso 4: Perfil de Negocio
      business: this.fb.group({
        companyName: ['', [Validators.required]],
        industry: ['', [Validators.required]],
        numberOfEmployees: ['', [Validators.required]],
        address: [''],
        website: [''],
        logoFile: [null],
      }),
      // Paso 5: Términos
      plan: this.fb.group({
        agreeToTerms: [false, [Validators.requiredTrue]],
      }),
    });

    this.activatedRoute.queryParams.subscribe((params) => {
      const token = params['token'];
      const socialRegistration = params['social_registration'];
      if (token || socialRegistration === 'true') {
        const tokenToUse = token || '';
        this.authService.getSocialRegisterInfo(tokenToUse).subscribe({
          next: (info) => {
            this.registerForm.patchValue({
              accountInfo: {
                firstName: info.firstName,
                lastName: info.lastName,
                email: info.email,
              },
            });
          },
        });
      }
    });
  }

  // Getters para el template
  get accountInfo() {
    return this.registerForm.get('accountInfo') as FormGroup;
  }
  get business() {
    return this.registerForm.get('business') as FormGroup;
  }
  get configuration() {
    return this.registerForm.get('configuration') as FormGroup;
  }
  get plan() {
    return this.registerForm.get('plan') as FormGroup;
  }

  private getCurrentStepForm(): AbstractControl | null {
    const stepNames = ['accountInfo', 'otp', 'configuration', 'business', 'plan'];
    return this.registerForm.get(stepNames[this.currentStep() - 1]);
  }

  nextStep(): void {
    const currentForm = this.getCurrentStepForm();
    if (currentForm?.invalid) {
      currentForm.markAllAsTouched();
      this.errorMessage.set(
        'Por favor, completa los campos requeridos correctamente.',
      );
      return;
    }

    if (this.currentStep() === 1) {
        this.initiateSignup();
        return;
    }

    if (this.currentStep() === 2) {
        // OTP is handled by onOtpVerify
        return;
    }

    // Validación específica antes de pasar del paso 3 (Config)
    if (this.currentStep() === 3) {
      const regionId = this.registerForm.get(
        'configuration.fiscalRegionId',
      )?.value;
      const currentCountry = this.countryService
        .currentCountryCode()
        .toUpperCase();

      if (['DO', 'PA', 'US', 'CO'].includes(currentCountry) && !regionId) {
        this.errorMessage.set(
          'Error de configuración: No se ha cargado la región fiscal. Por favor recarga la página o verifica tu conexión.',
        );
        return;
      }
    }

    this.stepsCompleted.update((completed) => {
      const newCompleted = [...completed];
      newCompleted[this.currentStep() - 1] = true;
      return newCompleted;
    });

    if (this.currentStep() < 5) {
      this.currentStep.update((step) => step + 1);
      this.errorMessage.set(null);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((step) => step - 1);
    }
  }

  navigateToStep(stepIndex: number): void {
    if (
      stepIndex < this.currentStep() &&
      this.stepsCompleted()[stepIndex - 1]
    ) {
      this.currentStep.set(stepIndex);
    }
  }

  initiateSignup(): void {
      this.isRegistering.set(true);
      this.errorMessage.set(null);
      const { email, passwordGroup } = this.accountInfo.getRawValue();

      this.recaptchaV3Service.execute('signup').subscribe({
        next: (recaptchaToken) => {
          this.authService.initiateSignup({ email, password: passwordGroup.password, recaptchaToken }).subscribe({
            next: () => {
                this.isRegistering.set(false);
                this.stepsCompleted.update(c => { c[0] = true; return [...c]; });
                this.currentStep.set(2);
            },
            error: (err) => {
                this.errorMessage.set(err.error?.message || 'Error al iniciar registro.');
                this.isRegistering.set(false);
            }
          });
        },
        error: () => {
          this.errorMessage.set('Error al validar seguridad (reCAPTCHA).');
          this.isRegistering.set(false);
        }
      });
  }

  onOtpVerify(otp: string): void {
      this.isRegistering.set(true);
      this.errorMessage.set(null);
      const email = this.accountInfo.get('email')?.value;

      this.authService.verifySignup({ email, otp }).subscribe({
          next: (res) => {
              this.onboardingToken.set(res.onboardingToken);
              this.isRegistering.set(false);
              this.stepsCompleted.update(c => { c[1] = true; return [...c]; });
              this.currentStep.set(3);
          },
          error: (err) => {
              this.errorMessage.set('Código inválido.');
              this.isRegistering.set(false);
          }
      });
  }

  onSubmit(): void {
    if (this.isRegistering() || !this.onboardingToken()) return;

    this.isRegistering.set(true);
    this.errorMessage.set(null);

    const formValue = this.registerForm.getRawValue();

    this.recaptchaV3Service.execute('completeOnboarding').subscribe({
      next: (recaptchaToken) => {
        const regionId = formValue.configuration.fiscalRegionId;

        const payload: any = {
          onboardingToken: this.onboardingToken()!,
          firstName: formValue.accountInfo.firstName,
          lastName: formValue.accountInfo.lastName,
          email: formValue.accountInfo.email,
          phone: formValue.accountInfo.phone,
          companyName: formValue.business.companyName,
          country: formValue.configuration.country,
          taxId: formValue.configuration.taxId,
          fiscalRegionId: regionId && regionId !== '' ? regionId : undefined,
          industry: formValue.business.industry,
          regime: formValue.configuration.fiscalRegionId || 'standard', // Fallback or logic
          recaptchaToken,
        };

        this.authService.completeOnboarding(payload).subscribe({
          next: () => {
            this.isRegistering.set(false);
            this.router.navigate(['/auth/plan-selection']);
          },
          error: (err) => {
            let msg = 'Error desconocido en el registro.';
            if (err.error?.message) {
              msg = Array.isArray(err.error.message)
                ? err.error.message.join(', ')
                : err.error.message;
            }
            this.errorMessage.set(msg);
            this.isRegistering.set(false);
          },
        });
      },
      error: () => {
        this.errorMessage.set('Error al validar seguridad (reCAPTCHA).');
        this.isRegistering.set(false);
      },
    });
  }
}
