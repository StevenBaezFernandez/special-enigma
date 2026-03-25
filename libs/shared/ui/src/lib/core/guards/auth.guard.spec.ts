import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { LanguageService } from '../services/language';
import { authGuard } from './auth.guard';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('authGuard', () => {
  const mockAuthService = {
    isAuthenticated: vi.fn(),
    checkAuthStatus: vi.fn()
  };
  const mockRouter = {
    createUrlTree: vi.fn()
  };
  const mockLanguageService = {
    currentLang: vi.fn().mockReturnValue('en')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: LanguageService, useValue: mockLanguageService }
      ]
    });
  });

  it('should allow access if authenticated', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    const result = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    if (result instanceof Promise) {
        expect(await result).toBe(true);
    } else {
        // Handle Observable or boolean
        if (typeof result === 'boolean') {
            expect(result).toBe(true);
        } else if (result && 'subscribe' in result) {
             result.subscribe(val => expect(val).toBe(true));
        } else {
             // Handle UrlTree if returned directly
             expect(result).toBe(true);
        }
    }
  });

  it('should check auth status if not authenticated initially', async () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.checkAuthStatus.mockReturnValue(of(true));

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));

    if (typeof result === 'boolean') {
         expect(result).toBe(true);
    } else if (result instanceof Promise) {
         expect(await result).toBe(true);
    } else if (result && 'subscribe' in result) {
         return new Promise<void>(resolve => {
             result.subscribe(val => {
                 expect(val).toBe(true);
                 resolve();
             });
         });
    }
  });
});
