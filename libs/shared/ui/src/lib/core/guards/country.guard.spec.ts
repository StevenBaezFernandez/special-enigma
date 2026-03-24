import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CountryGuard } from '../../core/guards/country.guard';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, firstValueFrom } from 'rxjs';
import { vi } from 'vitest';

describe('CountryGuard', () => {
  let guard: CountryGuard;
  let httpMock: HttpTestingController;

  const mockRouter = {
    createUrlTree: vi.fn(),
    parseUrl: vi.fn()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CountryGuard,
        { provide: Router, useValue: mockRouter }
      ]
    });
    guard = TestBed.inject(CountryGuard);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow navigation if allowed is true', async () => {
    const resultPromise = firstValueFrom(guard.canActivate() as any);

    const request = httpMock.expectOne('/api/auth/security/context-check');
    expect(request.request.method).toBe('POST');
    request.flush({ allowed: true });

    const result = await resultPromise;
    expect(result).toBe(true);
  });

  it('should redirect if allowed is false', async () => {
    const resultPromise = firstValueFrom(guard.canActivate() as any);

    const request = httpMock.expectOne('/api/auth/security/context-check');
    request.flush({ allowed: false });

    await resultPromise;
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/not-allowed-country']);
  });
});
