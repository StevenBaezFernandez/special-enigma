import { of, throwError } from 'rxjs';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SyncOrchestratorService } from './sync-orchestrator.service';
import { SyncItem } from './sync.types';

describe('SyncOrchestratorService', () => {
  const now = Date.now();
  const baseItem: SyncItem = {
    id: 'item-1',
    url: '/api/mobile/sync',
    method: 'POST',
    payload: { amount: 10 },
    timestamp: now - 10_000,
    retryCount: 0,
    status: 'pending',
  };

  const http = { request: vi.fn() } as any;
  const queue = {
    items: vi.fn(),
    remove: vi.fn(),
    update: vi.fn(),
  } as any;
  const token = { hasAccessToken: vi.fn() } as any;

  let service: SyncOrchestratorService;

  beforeEach(() => {
    vi.restoreAllMocks();
    queue.items.mockReturnValue([baseItem]);
    token.hasAccessToken.mockReturnValue(true);
    service = new SyncOrchestratorService(http, queue, token);
  });

  it('removes queue item when sync succeeds', async () => {
    http.request.mockReturnValue(of({ status: 200 }));

    await service.processQueue();

    expect(queue.remove).toHaveBeenCalledWith(baseItem.id);
    expect(queue.update).not.toHaveBeenCalled();
  });

  it('flags conflict on 409 responses', async () => {
    http.request.mockReturnValue(throwError(() => ({ status: 409, message: 'conflict' })));

    await service.processQueue();

    expect(queue.update).toHaveBeenCalledWith(
      baseItem.id,
      expect.objectContaining({
        status: 'failed',
        conflictMessage: 'Server state changed. Please review.',
      })
    );
  });

  it('increments retry counter for retryable errors', async () => {
    http.request.mockReturnValue(throwError(() => ({ status: 503, message: 'service unavailable' })));

    await service.processQueue();

    expect(queue.update).toHaveBeenCalledWith(
      baseItem.id,
      expect.objectContaining({
        retryCount: 1,
        lastError: 'service unavailable',
      })
    );
  });
});
