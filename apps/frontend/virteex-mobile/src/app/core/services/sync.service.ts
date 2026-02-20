import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface SyncItem {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE';
  payload: any;
  timestamp: number;
  retryCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private queue = signal<SyncItem[]>([]);
  private isOnline = signal<boolean>(navigator.onLine);
  private isProcessing = false;

  constructor(private http: HttpClient) {
    this.loadQueue();
    this.setupListeners();
  }

  // Real offline-first logic: Queue requests when offline
  async request(method: 'POST' | 'PUT' | 'DELETE', url: string, payload: any) {
    if (this.isOnline()) {
      try {
        return await firstValueFrom(this.http.request(method, url, { body: payload }));
      } catch (e: any) {
        // Fallback to queue if network fails (status 0) or server error (5xx)
        if (e.status === 0 || e.status >= 500) {
            console.warn('Network/Server request failed, queueing for retry', e);
            this.addToQueue({ id: crypto.randomUUID(), url, method, payload, timestamp: Date.now(), retryCount: 0 });
            return { offline: true, message: 'Request queued' };
        }
        // 4xx errors bubble up immediately
        throw e;
      }
    } else {
      this.addToQueue({ id: crypto.randomUUID(), url, method, payload, timestamp: Date.now(), retryCount: 0 });
      return { offline: true, message: 'Request queued' };
    }
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
    const stored = localStorage.getItem('sync_queue');
    if (stored) {
      this.queue.set(JSON.parse(stored));
    }
  }

  private saveQueue(queue: SyncItem[]) {
      localStorage.setItem('sync_queue', JSON.stringify(queue));
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
        const snapshot = [...this.queue()]; // Snapshot for iteration

        console.log(`Processing ${snapshot.length} offline items...`);

        for (const item of snapshot) {
            // Check if item still exists in live queue
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

                if (e.status >= 400 && e.status < 500) {
                    // Client error (4xx) - discard
                    console.warn(`Discarding item ${item.id} due to client error ${e.status}`);
                    this.removeFromQueue(item.id);
                } else {
                    // Server/Network error - keep and retry
                    this.updateItem(item.id, {
                        retryCount: item.retryCount + 1,
                        timestamp: Date.now()
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
}
