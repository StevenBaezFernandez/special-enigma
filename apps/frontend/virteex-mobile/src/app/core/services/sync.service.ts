import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface SyncItem {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE';
  payload: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private queue = signal<SyncItem[]>([]);
  private isOnline = signal<boolean>(navigator.onLine);

  constructor(private http: HttpClient) {
    this.loadQueue();
    this.setupListeners();
  }

  // Real offline-first logic: Queue requests when offline
  async request(method: 'POST' | 'PUT' | 'DELETE', url: string, payload: any) {
    if (this.isOnline()) {
      try {
        return await firstValueFrom(this.http.request(method, url, { body: payload }));
      } catch (e) {
        // Fallback to queue if network fails unexpectedly
        console.warn('Network request failed, queueing for retry', e);
        this.addToQueue({ id: crypto.randomUUID(), url, method, payload, timestamp: Date.now() });
        return { offline: true, message: 'Request queued' };
      }
    } else {
      this.addToQueue({ id: crypto.randomUUID(), url, method, payload, timestamp: Date.now() });
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
    localStorage.setItem('sync_queue', JSON.stringify(updated));
  }

  private loadQueue() {
    const stored = localStorage.getItem('sync_queue');
    if (stored) {
      this.queue.set(JSON.parse(stored));
    }
  }

  private async processQueue() {
    const currentQueue = this.queue();
    if (currentQueue.length === 0) return;

    console.log(`Processing ${currentQueue.length} offline items...`);

    const remaining: SyncItem[] = [];

    for (const item of currentQueue) {
      try {
        await firstValueFrom(this.http.request(item.method, item.url, { body: item.payload }));
        console.log(`Synced item ${item.id}`);
      } catch (e) {
        console.error(`Failed to sync item ${item.id}`, e);
        remaining.push(item); // Keep in queue if it fails again
      }
    }

    this.queue.set(remaining);
    localStorage.setItem('sync_queue', JSON.stringify(remaining));
  }
}
