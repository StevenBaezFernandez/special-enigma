import { Injectable } from '@angular/core';
import { StorageService } from '../storage.service';
import { SyncItem } from './sync.types';

@Injectable({ providedIn: 'root' })
export class SyncPersistenceService {
  private readonly storageKey = 'virteex_sync_queue_v2';

  constructor(private readonly storage: StorageService) {}

  async loadQueue(): Promise<SyncItem[]> {
    return (await this.storage.get<SyncItem[]>(this.storageKey)) ?? [];
  }

  async saveQueue(queue: SyncItem[]): Promise<void> {
    await this.storage.set(this.storageKey, queue);
  }
}
