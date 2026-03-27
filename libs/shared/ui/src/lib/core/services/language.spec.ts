import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UsersService } from '../api/users.service';
import { PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';

describe('LanguageService', () => {
  let service: LanguageService;
  let translateService: any;
  let router: any;
  let usersService: any;

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

    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        { provide: TranslateService, useValue: translateService },
        { provide: Router, useValue: router },
        { provide: UsersService, useValue: usersService },
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
    router.navigateByUrl.mockClear();
    service.setLanguage('es'); // Default is 'es'
    TestBed.flushEffects();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});

const vi = (global as any).vi;
