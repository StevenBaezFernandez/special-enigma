import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get tokens', () => {
    service.setTokens('access', 'refresh');
    expect(service.getAccessToken()).toBe('access');
    expect(service.getRefreshToken()).toBeNull();
  });

  it('should clear tokens', () => {
    service.setTokens('access', 'refresh');
    service.clearTokens();
    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
  });
});
