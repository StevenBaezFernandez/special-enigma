import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UsersService } from '../api/users.service';
import { AuthService } from './auth';
import { PLATFORM_ID, signal } from '@angular/core';
import { of } from 'rxjs';

describe('LanguageService', () => {
  let service: LanguageService;
  let translateService: any;
  let router: any;
  let usersService: any;
  let authService: any;

  beforeEach(() => {
    translateService = {
      addLangs: vi.fn(),
      setDefaultLang: vi.fn(),
      use: vi.fn(),
      getBrowserLang: vi.fn().mockReturnValue('en')
    };
    router = {
      url: '/es/dashboard',
      navigateByUrl: vi.fn()
    };
    usersService = {
      updateProfile: vi.fn().mockReturnValue(of({}))
    };
    authService = {
      currentUser: signal(null)
    };

    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        { provide: TranslateService, useValue: translateService },
        { provide: Router, useValue: router },
        { provide: UsersService, useValue: usersService },
        { provide: AuthService, useValue: authService },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(LanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update URL when language changes', () => {
    service.setLanguage('en');
    // The effect might take a cycle to run
    TestBed.flushEffects();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/en/dashboard');
  });

  it('should not update URL if current language is same', () => {
    service.setLanguage('es'); // Default is 'es'
    TestBed.flushEffects();
    router.navigateByUrl.mockClear();

    service.setLanguage('es');
    TestBed.flushEffects();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should sync with user profile if logged in', () => {
    const user = { id: '1', preferredLanguage: 'es' };
    authService.currentUser.set(user);

    service.setLanguage('en');
    TestBed.flushEffects();

    expect(usersService.updateProfile).toHaveBeenCalledWith({ preferredLanguage: 'en' });
  });
});

const vi = (global as any).vi;
