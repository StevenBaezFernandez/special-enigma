import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LanguageService } from '../../core/services/language';
import { languageInitGuard } from '../../core/guards/language-init.guard';
import { vi } from 'vitest';

describe('languageInitGuard', () => {
  const mockRouter = {
    createUrlTree: vi.fn()
  };
  const mockLanguageService = {
    setLanguage: vi.fn(),
    getInitialLanguage: vi.fn().mockReturnValue('es')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: LanguageService, useValue: mockLanguageService }
      ]
    });
  });

  it('should allow navigation if lang is supported', () => {
    const route = { params: { lang: 'es' } } as any;
    const state = { url: '/es/home' } as any;
    const result = TestBed.runInInjectionContext(() => languageInitGuard(route, state));
    expect(result).toBe(true);
    expect(mockLanguageService.setLanguage).toHaveBeenCalledWith('es');
  });

  it('should redirect if lang is not supported', () => {
    const route = { params: { lang: 'fr' } } as any;
    const state = { url: '/fr/home' } as any;
    const result = TestBed.runInInjectionContext(() => languageInitGuard(route, state));
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/es/home']);
  });
});
