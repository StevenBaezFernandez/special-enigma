import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TokenService } from '@virteex/shared-util-auth';
import { SyncQueueService } from './sync-queue.service';
import { SyncItem } from './sync.types';

@Injectable({ providedIn: 'root' })
export class SyncOrchestratorService {
  private isProcessing = false;

  constructor(
    private readonly http: HttpClient,
    private readonly queueService: SyncQueueService,
    private readonly tokenService: TokenService
  ) {}

  async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const snapshot = [...this.queueService.items()];
      if (snapshot.length === 0 || !this.tokenService.hasAccessToken()) {
        return;
      }

      for (const item of snapshot) {
        await this.processItem(item);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processItem(item: SyncItem): Promise<void> {
    const backoffTime = Math.pow(2, item.retryCount) * 1000;
    if (Date.now() - item.timestamp < backoffTime) {
      return;
    }

    try {
      await firstValueFrom(this.http.request(item.method, item.url, { body: item.payload }));
      await this.queueService.remove(item.id);
    } catch (e: any) {
      if (e.status >= 400 && e.status < 500 && e.status !== 408 && e.status !== 429) {
        if (e.status === 409) {
          await this.queueService.update(item.id, {
            status: 'failed',
            lastError: `Conflict: ${e.message}`,
            conflictMessage: 'Server state changed. Please review.',
          });
          return;
        }

        await this.queueService.remove(item.id);
        return;
      }

      await this.queueService.update(item.id, {
        retryCount: item.retryCount + 1,
        timestamp: Date.now(),
        lastError: e.message,
      });
    }
  }
}
