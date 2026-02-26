import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { SessionService } from '../services/session.service';
import { vi } from 'vitest';

describe('authGuard', () => {
  let sessionServiceSpy: { isLoggedIn: any };
  let routerSpy: { createUrlTree: any };

  beforeEach(() => {
    sessionServiceSpy = { isLoggedIn: vi.fn() };
    routerSpy = { createUrlTree: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: SessionService, useValue: sessionServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  it('should allow navigation if logged in', () => {
    sessionServiceSpy.isLoggedIn.mockReturnValue(true);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);
      expect(result).toBe(true);
    });
  });

  it('should redirect if not logged in', () => {
    sessionServiceSpy.isLoggedIn.mockReturnValue(false);
    const mockTree = {} as any;
    routerSpy.createUrlTree.mockReturnValue(mockTree);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, { url: '/test' } as any);
      expect(result).toBe(mockTree);
      expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/auth/login'], { queryParams: { returnUrl: '/test' } });
    });
  });
});
