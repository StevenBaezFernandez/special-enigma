import { TestBed } from '@angular/core/testing';
import { AuthQueueService } from './auth-queue.service';
import { take, firstValueFrom } from 'rxjs';

describe('AuthQueueService', () => {
  let service: AuthQueueService;

  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [AuthQueueService]
    });
    service = TestBed.inject(AuthQueueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with isRefreshing false', () => {
    expect(service.isRefreshingToken).toBe(false);
  });

  it('should update state on startRefresh', () => {
    service.startRefresh();
    expect(service.isRefreshingToken).toBe(true);
  });

  it('should update state on finishRefreshSuccess', () => {
    service.startRefresh();
    service.finishRefreshSuccess();
    expect(service.isRefreshingToken).toBe(false);
  });

  it('should emit true on finishRefreshSuccess', async () => {
    service.startRefresh();
    const promise = firstValueFrom(service.waitForTokenRefresh());
    service.finishRefreshSuccess();
    const result = await promise;
    expect(result).toBe(true);
  });

  it('should emit false on finishRefreshError', async () => {
    service.startRefresh();
    const promise = firstValueFrom(service.waitForTokenRefresh());
    service.finishRefreshError();
    const result = await promise;
    expect(result).toBe(false);
  });
});
