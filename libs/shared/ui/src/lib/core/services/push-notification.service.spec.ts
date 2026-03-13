import { TestBed } from '@angular/core/testing';
import { PushNotificationService } from '../../core/services/push-notification.service';
import { SwPush } from '@angular/service-worker';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { APP_CONFIG } from '@virteex/shared-config';
import { vi } from 'vitest';

class MockSwPush {
  isEnabled = false;
  requestSubscription = vi.fn();
}

describe('PushNotificationService', () => {
  let service: PushNotificationService;
  let swPush: SwPush;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PushNotificationService,
        { provide: SwPush, useClass: MockSwPush },
        { provide: APP_CONFIG, useValue: { apiUrl: 'http://test', production: false, recaptcha: { siteKey: 'test' } } }
      ]
    });
    service = TestBed.inject(PushNotificationService);
    swPush = TestBed.inject(SwPush);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not request subscription if service worker is not enabled', () => {
    const spy = vi.spyOn(console, 'warn');
    service.subscribeToNotifications();
    expect(swPush.requestSubscription).not.toHaveBeenCalled();
    expect(spy).not.toHaveBeenCalled();
  });
});
