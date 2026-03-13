import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CountryService } from '../../core/services/country.service';
import { LanguageService } from '../../core/services/language';
import { GeoLocationService } from '../../core/services/geo-location.service';
import { CountryGuard } from '../../core/guards/country.guard';
import { of, firstValueFrom } from 'rxjs';
import { vi } from 'vitest';

describe('CountryGuard', () => {
  let guard: CountryGuard;
  const mockCountryService = {
    getCountryConfig: vi.fn()
  };
  const mockLanguageService = {
    setLanguage: vi.fn()
  };
  const mockGeoService = {
    checkAndNotifyMismatch: vi.fn()
  };
  const mockRouter = {
    createUrlTree: vi.fn(),
    parseUrl: vi.fn()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CountryGuard,
        { provide: CountryService, useValue: mockCountryService },
        { provide: LanguageService, useValue: mockLanguageService },
        { provide: GeoLocationService, useValue: mockGeoService },
        { provide: Router, useValue: mockRouter }
      ]
    });
    guard = TestBed.inject(CountryGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should redirect if params missing', () => {
    const route = { paramMap: { get: vi.fn().mockReturnValue(null) } } as any;
    guard.canActivate(route, {} as any);
    expect(mockRouter.createUrlTree).toHaveBeenCalled();
  });

  it('should allow navigation if country matches', async () => {
    const route = { paramMap: { get: vi.fn().mockReturnValue('us') } } as any;
    mockCountryService.getCountryConfig.mockReturnValue(of({ code: 'us' }));

    const result$ = guard.canActivate(route, { url: '/en/us/home'} as any) as any;
    const result = await firstValueFrom(result$);
    expect(result).toBe(true);
  });
});
