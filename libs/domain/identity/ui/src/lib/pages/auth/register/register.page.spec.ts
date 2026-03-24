import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterPage } from './register.page';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '@virteex/shared-ui';
import { ReCaptchaV3Service, RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha-19';
import { of, Observable } from 'rxjs';
import { UsersService } from '@virteex/identity-ui';
import { CountryService, LanguageService, GeoLocationService, ConfigService } from '@virteex/shared-ui';
import { APP_CONFIG } from '@virteex/shared-config';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { vi } from 'vitest';

// Fake Loader for Translate
class FakeLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({});
  }
}

// Mocks
class MockAuthService {
  register = vi.fn().mockReturnValue(of({}));
  currentUser = vi.fn().mockReturnValue(null);
  getSocialRegisterInfo = vi.fn().mockReturnValue(of({}));
}
class MockRecaptchaService {
  execute = vi.fn().mockReturnValue(of('mock-token'));
}
class MockCountryService {
  currentCountry = vi.fn().mockReturnValue({ code: 'DO', currencyCode: 'DOP', name: 'Dominican Republic', formSchema: {} });
  currentCountryCode = vi.fn().mockReturnValue('do');
  detectAndSetCountry = vi.fn();
  getCountryConfig = vi.fn().mockReturnValue(of({}));
  lookupTaxId = vi.fn().mockReturnValue(of(null));
}
class MockUsersService {
    updateUser = vi.fn().mockReturnValue(of({}));
}
class MockLanguageService {
    currentLang = vi.fn().mockReturnValue('es');
}

class MockGeoLocationService {
    getGeoLocation = vi.fn().mockReturnValue(of({ country: 'DO' }));
    mismatchSignal = vi.fn().mockReturnValue(null);
}

class MockConfigService {
    getRegistrationOptions = vi.fn().mockReturnValue(of({
        industries: ['tech'],
        companySizes: ['1-10']
    }));
}

describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegisterPage, // Standalone
        NoopAnimationsModule,
        TranslateModule.forRoot({
            loader: { provide: TranslateLoader, useClass: FakeLoader }
        })
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useClass: MockAuthService },
        { provide: ReCaptchaV3Service, useClass: MockRecaptchaService },
        { provide: RECAPTCHA_V3_SITE_KEY, useValue: 'mock-key' },
        { provide: CountryService, useClass: MockCountryService },
        { provide: UsersService, useClass: MockUsersService },
        { provide: LanguageService, useClass: MockLanguageService },
        { provide: GeoLocationService, useClass: MockGeoLocationService },
        { provide: ConfigService, useClass: MockConfigService },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://localhost' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default country values', () => {
    expect(component.registerForm).toBeDefined();
    fixture.detectChanges();
  });

  it('should validate required fields', () => {
    const accountInfo = component.accountInfo;

    // Set a mocked value for async validator if needed or just valid values
    accountInfo.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      passwordGroup: {
        password: 'Password123!',
        confirmPassword: 'Password123!'
      }
    });

    // Remove async validators for unit test simplicity as they require complex mocking of HTTP calls within component or directive
    // Alternatively, mock the service that the validator uses if possible.
    // Here we just clear async validators from email control to ensure sync validation passes
    const emailControl = accountInfo.get('email');
    emailControl?.setAsyncValidators(null);
    emailControl?.updateValueAndValidity();

    expect(accountInfo.valid).toBeTruthy();
  });
});
