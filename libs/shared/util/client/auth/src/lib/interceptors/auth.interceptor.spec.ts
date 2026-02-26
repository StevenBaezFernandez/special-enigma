import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { TokenService } from '../services/token.service';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { API_URL } from '@virteex/shared-config';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let tokenServiceSpy: { getAccessToken: any; clearTokens: any; setAccessToken: any };
  let routerSpy: { navigate: any };

  beforeEach(() => {
    tokenServiceSpy = {
      getAccessToken: vi.fn(),
      clearTokens: vi.fn(),
      setAccessToken: vi.fn()
    };
    routerSpy = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: API_URL, useValue: 'http://api' }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should add Authorization header if token exists', () => {
    tokenServiceSpy.getAccessToken.mockReturnValue('mock-token');

    httpClient.get('/api/test').subscribe();

    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
    req.flush({});
  });

  it('should not add Authorization header if token does not exist', () => {
    tokenServiceSpy.getAccessToken.mockReturnValue(null);

    httpClient.get('/api/test').subscribe();

    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should attempt refresh on 401', () => {
    tokenServiceSpy.getAccessToken.mockReturnValue('mock-token');

    httpClient.get('/api/test').subscribe();

    const req = httpTestingController.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Expect refresh call
    const refreshReq = httpTestingController.expectOne('http://api/auth/refresh');
    expect(refreshReq.request.method).toBe('POST');
    refreshReq.flush({ accessToken: 'new-token' });

    // Expect retry of original request with new token
    const retryReq = httpTestingController.expectOne('/api/test');
    expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-token');
    retryReq.flush({});

    expect(tokenServiceSpy.setAccessToken).toHaveBeenCalledWith('new-token');
  });

  it('should redirect to login if refresh fails', () => {
    tokenServiceSpy.getAccessToken.mockReturnValue('mock-token');

    httpClient.get('/api/test').subscribe({
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(401); // Original error propagates
      }
    });

    const req = httpTestingController.expectOne('/api/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Expect refresh call
    const refreshReq = httpTestingController.expectOne('http://api/auth/refresh');
    refreshReq.flush('Refresh Failed', { status: 401, statusText: 'Unauthorized' });

    expect(tokenServiceSpy.clearTokens).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
