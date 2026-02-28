import { Injectable, signal } from '@angular/core';
import { SyncPersistenceService } from './sync-persistence.service';
import { SyncItem } from './sync.types';

@Injectable({ providedIn: 'root' })
export class SyncQueueService {
  private readonly queue = signal<SyncItem[]>([]);

  constructor(private readonly persistence: SyncPersistenceService) {}

  get items() {
    return this.queue.asReadonly();
  }

  async initialize(): Promise<void> {
    this.queue.set(await this.persistence.loadQueue());
  }

  async add(item: SyncItem): Promise<void> {
    const updated = [...this.queue(), item];
    this.queue.set(updated);
    await this.persistence.saveQueue(updated);
  }

  async remove(id: string): Promise<void> {
    const updated = this.queue().filter((item) => item.id !== id);
    this.queue.set(updated);
    await this.persistence.saveQueue(updated);
  }

  async update(id: string, changes: Partial<SyncItem>): Promise<void> {
    const updated = this.queue().map((item) => (item.id === id ? { ...item, ...changes } : item));
    this.queue.set(updated);
    await this.persistence.saveQueue(updated);
  }
}
