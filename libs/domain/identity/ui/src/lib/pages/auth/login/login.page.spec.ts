import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '../../../services/auth.service';
import { ReCaptchaV3Service, RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha-19';
import { of, Observable } from 'rxjs';
import { CountryService } from '@virteex/shared-ui';
import { LanguageService } from '@virteex/shared-ui';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { AuthLayoutComponent } from '../components/auth-layout/auth-layout.component';
import { AuthInputComponent } from '../components/auth-input/auth-input.component';
import { AuthButtonComponent } from '../components/auth-button/auth-button.component';
import { SocialAuthButtonsComponent } from '../components/social-auth-buttons/social-auth-buttons.component';
import { PasskeyButtonComponent } from '../components/passkey-button/passkey-button.component';
import { vi } from 'vitest';

// Fake Loader for Translate
class FakeLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({});
  }
}

// Mocks
class MockAuthService {
  login = vi.fn().mockReturnValue(of({ user: { id: 1 }, accessToken: 'token' }));
  loginWithPasskey = vi.fn().mockReturnValue(Promise.resolve({ id: 1 }));
  verify2fa = vi.fn().mockReturnValue(of({ user: { id: 1 } }));
}
class MockRecaptchaService {
  execute = vi.fn().mockReturnValue(of('mock-token'));
}
class MockCountryService {
  currentCountry = vi.fn().mockReturnValue({ code: 'DO', currencyCode: 'DOP', name: 'Dominican Republic' });
  detectAndSetCountry = vi.fn();
}
class MockLanguageService {
    currentLang = vi.fn().mockReturnValue('es');
    setLanguage = vi.fn();
}

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginPage,
        NoopAnimationsModule,
        TranslateModule.forRoot({
            loader: { provide: TranslateLoader, useClass: FakeLoader }
        }),
        AuthLayoutComponent,
        AuthInputComponent,
        AuthButtonComponent,
        SocialAuthButtonsComponent,
        PasskeyButtonComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useClass: MockAuthService },
        { provide: ReCaptchaV3Service, useClass: MockRecaptchaService },
        { provide: RECAPTCHA_V3_SITE_KEY, useValue: 'mock-key' },
        { provide: CountryService, useClass: MockCountryService },
        { provide: LanguageService, useClass: MockLanguageService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should be valid when filled', () => {
    component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123'
    });
    expect(component.loginForm.valid).toBeTruthy();
  });
});
