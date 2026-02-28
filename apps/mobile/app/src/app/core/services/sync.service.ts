import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { ConnectivityService } from './sync/connectivity.service';
import { SyncQueueService } from './sync/sync-queue.service';
import { ConflictResolverService } from './sync/conflict-resolver.service';
import { DownSyncService } from './sync/down-sync.service';
import { SyncOrchestratorService } from './sync/sync-orchestrator.service';
import { ConflictStrategy, SyncItem } from './sync/sync.types';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  get isOnline() {
    return this.connectivity.isOnline;
  }

  constructor(
    private readonly http: HttpClient,
    private readonly connectivity: ConnectivityService,
    private readonly queueService: SyncQueueService,
    private readonly conflictResolver: ConflictResolverService,
    private readonly downSyncService: DownSyncService,
    private readonly syncOrchestrator: SyncOrchestratorService
  ) {
    this.queueService.initialize();
    this.setupListeners();

    if (this.isOnline()) {
      this.downSync();
    }
  }

  get queueItems() {
    return this.queueService.items;
  }

  async request(method: 'POST' | 'PUT' | 'DELETE', url: string, payload: unknown, conflictStrategy: ConflictStrategy = 'serverWins') {
    if (this.isOnline()) {
      try {
        return await firstValueFrom(this.http.request(method, url, { body: payload }));
      } catch (e: any) {
        if (e.status === 0 || e.status >= 500) {
          await this.enqueue(method, url, payload, e.message);
          return { offline: true, message: 'Request queued due to network/server error' };
        }

        if (e.status === 409) {
          return this.conflictResolver.resolve(conflictStrategy, e);
        }

        throw e;
      }
    }

    await this.enqueue(method, url, payload);
    return { offline: true, message: 'Request queued (offline)' };
  }

  async downSync() {
    if (!this.isOnline()) {
      return;
    }

    try {
      await this.downSyncService.syncWarehouses();
    } catch (error) {
      console.error('Down-Sync failed', error);
    }
  }

  dismissItem(id: string) {
    this.queueService.remove(id);
  }

  private setupListeners() {
    this.connectivity.onOnline(() => {
      this.syncOrchestrator.processQueue();
      this.downSync();
    });

    this.connectivity.onOffline();
  }

  private async enqueue(method: 'POST' | 'PUT' | 'DELETE', url: string, payload: unknown, lastError?: string): Promise<void> {
    await this.queueService.add({
      id: uuidv4(),
      url,
      method,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
      lastError,
    });
  }
}

export type { SyncItem, ConflictStrategy } from './sync/sync.types';
