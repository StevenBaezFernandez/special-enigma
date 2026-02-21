import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface SyncItem {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE';
  payload: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'failed' | 'synced';
  lastError?: string;
  conflictMessage?: string;
}

export type ConflictStrategy = 'serverWins' | 'clientWins' | 'manual';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private queue = signal<SyncItem[]>([]);
  private isOnline = signal<boolean>(navigator.onLine);
  private isProcessing = false;
  private readonly STORAGE_KEY = 'virteex_sync_queue_v2';

  constructor(private http: HttpClient) {
    this.loadQueue();
    this.setupListeners();
  }

  get queueItems() {
    return this.queue.asReadonly();
  }

  // Real offline-first logic: Queue requests when offline
  async request(method: 'POST' | 'PUT' | 'DELETE', url: string, payload: any, conflictStrategy: ConflictStrategy = 'serverWins') {
    if (this.isOnline()) {
      try {
        // Optimistic UI update logic could go here
        return await firstValueFrom(this.http.request(method, url, { body: payload }));
      } catch (e: any) {
        // Fallback to queue if network fails (status 0) or server error (5xx)
        if (e.status === 0 || e.status >= 500) {
            console.warn('Network/Server request failed, queueing for retry', e);
            this.addToQueue({
                id: crypto.randomUUID(),
                url,
                method,
                payload,
                timestamp: Date.now(),
                retryCount: 0,
                status: 'pending',
                lastError: e.message
            });
            return { offline: true, message: 'Request queued due to network error' };
        }

        // Handle 409 Conflict specifically?
        if (e.status === 409) {
            return this.handleConflict(conflictStrategy, method, url, payload, e);
        }

        // 4xx errors bubble up immediately as they are logic errors usually
        throw e;
      }
    } else {
      this.addToQueue({
          id: crypto.randomUUID(),
          url,
          method,
          payload,
          timestamp: Date.now(),
          retryCount: 0,
          status: 'pending'
      });
      return { offline: true, message: 'Request queued (offline)' };
    }
  }

  private handleConflict(strategy: ConflictStrategy, method: string, url: string, payload: any, error: any) {
      if (strategy === 'clientWins') {
          // Force update? Or queue for retry?
          // If server rejects, we can't just retry same payload usually unless header changes.
          // For now, log and maybe queue with a flag?
          console.warn('Conflict detected, strategy clientWins. Re-queueing might not help without force flag.');
          return { conflict: true, message: 'Conflict detected, client wins strategy not fully implemented on backend' };
      } else if (strategy === 'manual') {
          // Notify user
          return { conflict: true, manualResolutionRequired: true, error };
      }
      // serverWins
      throw error;
  }

  private setupListeners() {
    window.addEventListener('online', () => {
      this.isOnline.set(true);
      this.processQueue();
    });
    window.addEventListener('offline', () => this.isOnline.set(false));
  }

  private addToQueue(item: SyncItem) {
    const current = this.queue();
    const updated = [...current, item];
    this.queue.set(updated);
    this.saveQueue(updated);
  }

  private loadQueue() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.queue.set(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse sync queue', e);
        this.queue.set([]);
      }
    }
  }

  private saveQueue(queue: SyncItem[]) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
        const snapshot = [...this.queue()]; // Snapshot for iteration
        if (snapshot.length === 0) return;

        console.log(`Processing ${snapshot.length} offline items...`);

        for (const item of snapshot) {
            // Check if item still exists in live queue (might be removed by UI)
            if (!this.queue().some(i => i.id === item.id)) continue;

            // Exponential Backoff Check
            const backoffTime = Math.pow(2, item.retryCount) * 1000;
            if (Date.now() - item.timestamp < backoffTime) continue;

            try {
                await firstValueFrom(this.http.request(item.method, item.url, { body: item.payload }));
                console.log(`Synced item ${item.id}`);
                this.removeFromQueue(item.id);
            } catch (e: any) {
                console.error(`Failed to sync item ${item.id}`, e);

                if (e.status >= 400 && e.status < 500 && e.status !== 408 && e.status !== 429) {
                    // Client error (4xx) - discard as invalid (except timeouts/rate limits)
                    // Unless it's a conflict 409 we want to keep?
                    if (e.status === 409) {
                         this.updateItem(item.id, {
                            status: 'failed',
                            lastError: 'Conflict: ' + e.message,
                            conflictMessage: 'Server state changed. Please review.'
                        });
                        // Don't retry automatically
                        continue;
                    }

                    console.warn(`Discarding item ${item.id} due to client error ${e.status}`);
                    this.removeFromQueue(item.id);
                } else {
                    // Server/Network error - keep and retry
                    this.updateItem(item.id, {
                        retryCount: item.retryCount + 1,
                        timestamp: Date.now(),
                        lastError: e.message
                    });
                }
            }
        }
    } finally {
        this.isProcessing = false;
    }
  }

  private removeFromQueue(id: string) {
      const updated = this.queue().filter(i => i.id !== id);
      this.queue.set(updated);
      this.saveQueue(updated);
  }

  private updateItem(id: string, updates: Partial<SyncItem>) {
      const updated = this.queue().map(i => i.id === id ? { ...i, ...updates } : i);
      this.queue.set(updated);
      this.saveQueue(updated);
  }

  // Method for UI to clear specific failed item
  dismissItem(id: string) {
      this.removeFromQueue(id);
  }
}
