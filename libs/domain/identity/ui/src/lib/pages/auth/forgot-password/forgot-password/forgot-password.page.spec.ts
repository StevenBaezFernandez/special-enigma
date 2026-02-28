import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordPage } from './forgot-password.page';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from '../../../../services/auth.service';
import { LanguageService } from '@virteex/shared-ui';
import { of, Observable } from 'rxjs';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { AuthLayoutComponent } from '../../components/auth-layout/auth-layout.component';
import { AuthInputComponent } from '../../components/auth-input/auth-input.component';
import { AuthButtonComponent } from '../../components/auth-button/auth-button.component';
import { ReCaptchaV3Service, RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha-19';
import { APP_CONFIG } from '@virteex/shared-config';
import { vi } from 'vitest';

class FakeLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({});
  }
}

class MockAuthService {
  forgotPassword = vi.fn().mockReturnValue(of({ message: 'Success' }));
}
class MockRecaptchaService {
  execute = vi.fn().mockReturnValue(of('mock-token'));
}
class MockLanguageService {
    currentLang = vi.fn().mockReturnValue('es');
}

describe('ForgotPasswordPage', () => {
  let component: ForgotPasswordPage;
  let fixture: ComponentFixture<ForgotPasswordPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ForgotPasswordPage, // Standalone
        NoopAnimationsModule,
        TranslateModule.forRoot({
            loader: { provide: TranslateLoader, useClass: FakeLoader }
        }),
        AuthLayoutComponent,
        AuthInputComponent,
        AuthButtonComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useClass: MockAuthService },
        { provide: ReCaptchaV3Service, useClass: MockRecaptchaService },
        { provide: LanguageService, useClass: MockLanguageService },
        { provide: APP_CONFIG, useValue: { recaptcha: { siteKey: 'mock-key' } } },
        { provide: RECAPTCHA_V3_SITE_KEY, useValue: 'mock-key' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
