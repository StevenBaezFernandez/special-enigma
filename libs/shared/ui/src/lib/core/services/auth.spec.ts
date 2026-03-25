import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth';
import { API_URL } from '@virteex/shared-config';
import { NotificationService } from './notification';
import { WebSocketService } from './websocket.service';
import { ModalService } from '../../services/modal.service';
import { ErrorHandlerService } from './error-handler.service';
import { APP_CONFIG } from '@virteex/shared-config';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Subject, of, BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockRouter = {
    navigate: vi.fn(),
    navigateByUrl: vi.fn().mockResolvedValue(true),
  };

  const mockNotificationService = {
    showSuccess: vi.fn(),
    showError: vi.fn(),
  };

  const mockWebSocketService = {
    connectionReady$: new Subject(),
    connect: vi.fn(),
    emit: vi.fn(),
    listen: vi.fn().mockReturnValue(new Subject()),
    disconnect: vi.fn(),
  };

  const mockModalService = {
    open: vi.fn(),
  };

  const mockErrorHandlerService = {
    handleError: vi.fn().mockImplementation((op, err) => { throw err; }),
  };

  const mockGeoLocationService = {
    getGeoLocation: vi.fn().mockReturnValue(of({ country: 'DO', ip: '127.0.0.1' })),
    mismatchSignal: { set: vi.fn() },
  };

  const mockTranslateService = {
    use: vi.fn().mockReturnValue(of({})),
    addLangs: vi.fn(),
    setDefaultLang: vi.fn(),
    getBrowserLang: vi.fn().mockReturnValue('es')
  };

  beforeEach(() => {
    const mockRouterEvents = new BehaviorSubject<any>(null);
    const mockRouterWithEvents = {
      ...mockRouter,
      events: mockRouterEvents.asObservable(),
      url: '/',
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        AuthService,
        { provide: API_URL, useValue: 'http://test-api/v1' },
        { provide: Router, useValue: mockRouterWithEvents },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: WebSocketService, useValue: mockWebSocketService },
        { provide: ModalService, useValue: mockModalService },
        { provide: ErrorHandlerService, useValue: mockErrorHandlerService },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test-api/v1' } },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct API URL', () => {
    service.login({ email: 'test@test.com', password: '123', recaptchaToken: 'token' }).subscribe();
    const req = httpMock.expectOne('http://test-api/v1/auth/login');
    expect(req.request.method).toBe('POST');
  });
});
