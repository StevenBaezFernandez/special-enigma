import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { LanguageService } from '../../core/services/language';
import { languageRedirectGuard } from '../../core/guards/language-redirect.guard';
import { vi } from 'vitest';

describe('languageRedirectGuard', () => {
  const mockAuthService = {
    isAuthenticated: vi.fn()
  };
  const mockRouter = {
    createUrlTree: vi.fn()
  };
  const mockLanguageService = {
    getInitialLanguage: vi.fn().mockReturnValue('es')
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

  it('should redirect to dashboard if authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    const result = TestBed.runInInjectionContext(() => languageRedirectGuard({} as any, {} as any));
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should redirect to lang login if not authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
    const result = TestBed.runInInjectionContext(() => languageRedirectGuard({} as any, {} as any));
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/es/auth/login']);
  });
});
