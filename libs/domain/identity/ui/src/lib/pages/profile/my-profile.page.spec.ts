import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyProfilePage } from './my-profile.page';
import { UsersService, SecurityService } from '@virteex/identity-ui';
import { AuthService } from '@virteex/shared-ui';
import { NotificationService } from '@virteex/domain-identity-domain';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { vi } from 'vitest';

class FakeLoader implements TranslateLoader {
    getTranslation(lang: string) {
        return of({});
    }
}

const mockAuthService = {
  currentUser: () => ({ id: '1', firstName: 'John', lastName: 'Doe', email: 'john@doe.com' })
};
const mockUsersService = {
  updateProfile: vi.fn(() => of({})),
  getJobTitles: vi.fn(() => of(['Developer', 'Manager']))
};
const mockSecurityService = {
  getSecuritySettings: vi.fn(() => of({ mfaEnabled: false })),
  generateMfaSecret: vi.fn(() => of({ secret: 'secret', qrCode: 'qr' })),
  enableMfa: vi.fn(() => of({}))
};
const mockNotificationService = {
  showSuccess: vi.fn(),
  showError: vi.fn()
};

describe('MyProfilePage', () => {
  let component: MyProfilePage;
  let fixture: ComponentFixture<MyProfilePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MyProfilePage,
        NoopAnimationsModule,
        TranslateModule.forRoot({
            loader: { provide: TranslateLoader, useClass: FakeLoader }
        })
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: SecurityService, useValue: mockSecurityService },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
