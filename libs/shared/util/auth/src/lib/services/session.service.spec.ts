import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { API_URL } from '@virteex/shared-config';
import { vi } from 'vitest';

describe('SessionService', () => {
  let service: SessionService;
  let httpClientSpy: { get: any; post: any };
  let tokenServiceSpy: { getAccessToken: any };

  beforeEach(() => {
    httpClientSpy = {
      get: vi.fn(),
      post: vi.fn()
    };
    tokenServiceSpy = {
      getAccessToken: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: TokenService, useValue: tokenServiceSpy },
        { provide: API_URL, useValue: 'http://api' }
      ]
    });
    // restoreSession calls http.get immediately
    httpClientSpy.get.mockReturnValue(of({ id: '1', email: 'test@example.com' }));
    httpClientSpy.post.mockReturnValue(of({}));

    service = TestBed.inject(SessionService);
  });

  it('should be created and restore session', () => {
    expect(service).toBeTruthy();
    expect(httpClientSpy.get).toHaveBeenCalledWith('http://api/auth/me');
  });

  it('should login', async () => {
    httpClientSpy.get.mockReturnValue(of({ id: '1', email: 'test@example.com' }));
    service.login();
    expect(httpClientSpy.get).toHaveBeenCalled();
  });

  it('should logout', () => {
    service.logout();
    expect(httpClientSpy.post).toHaveBeenCalledWith('http://api/auth/logout', {});
    expect(service.user()).toBeNull();
  });
});
