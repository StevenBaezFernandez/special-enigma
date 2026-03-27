import { Component, Input, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CountryService, AsyncValidators } from '@virteex/shared-ui';
import { AuthInputComponent } from '../../../components/auth-input/auth-input.component';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG } from '@virteex/shared-config';
import { debounceTime, distinctUntilChanged, filter, tap, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'virteex-step-configuration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, AuthInputComponent],
  templateUrl: './step-configuration.html',
})
export class StepConfiguration implements OnInit {
  @Input() group!: FormGroup;
  @Input() parentForm?: FormGroup;

  public countryService: CountryService = inject(CountryService);
  private translate = inject(TranslateService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private config = inject(APP_CONFIG);
  private destroyRef = inject(DestroyRef);

  isValidating = signal(false);
  foundCompany = signal<any>(null);

  countries = [
    { code: 'DO', name: 'República Dominicana' },
    { code: 'CO', name: 'Colombia' },
    { code: 'MX', name: 'México' },
    { code: 'US', name: 'United States' },
    { code: 'PA', name: 'Panamá' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'PE', name: 'Perú' },
    { code: 'CL', name: 'Chile' }
  ];

  ngOnInit(): void {
    if (this.group) {
        const taxControl = this.group.get('taxId');
        if (taxControl) {
            taxControl.addAsyncValidators(AsyncValidators.createTaxIdValidator(this.http, this.config.apiUrl));
            taxControl.updateValueAndValidity();
        }

        this.group.get('taxId')?.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            filter(value => value && value.length > 5),
            tap(() => this.isValidating.set(true)),
            switchMap(value => {
                const country = this.group.get('country')?.value;
                return this.countryService.lookupTaxId(value, country).pipe(
                    catchError(() => of(null))
                );
            }),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((data) => {
            this.isValidating.set(false);
            if (data && data.isValid) {
                this.foundCompany.set(data);
                if (this.parentForm) {
                    this.parentForm.patchValue({
                        business: {
                            companyName: data.name,
                            // If the response has industry, map it too
                            industry: data.industry || this.parentForm.get('business.industry')?.value
                        }
                    });
                }
            } else {
                this.foundCompany.set(null);
            }
        });
    }
  }

  onFlagError(event: any) {
    event.target.src = 'assets/flags/do.svg'; // Fallback
  }

  onCountryChange(event: any) {
    const countryCode = event.target.value;

    // Update service (this will trigger the effect in RegisterPage to update form schema)
    this.countryService.getCountryConfig(countryCode).subscribe();

    // Update URL to reflect new country (so reload keeps it)
    // Current URL format: /:lang/:country/auth/register
    const currentUrl = this.router.url;
    const segments = currentUrl.split('/');
    // segments[0] is empty, [1] is lang, [2] is country
    if (segments.length > 2) {
      segments[2] = countryCode.toLowerCase();
      const newUrl = segments.join('/');
      this.router.navigateByUrl(newUrl);
    }
  }

  getTaxIdError(): string {
    const control = this.group.get('taxId');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'REGISTER.ERRORS.REQUIRED';
      if (control.errors['pattern']) return this.countryService.currentCountry()?.formSchema?.taxId?.errorMessage || 'REGISTER.ERRORS.INVALID_FORMAT';
      if (control.errors['taxIdExists']) return 'REGISTER.ERRORS.TAX_ID_EXISTS';
    }
    return '';
  }

  isValidTaxId() {
    return this.foundCompany() !== null;
  }
}
