import { Injectable, signal } from '@angular/core';
import { DatabaseService } from '../../../core/services/database.service';
import { SyncService } from '../../../core/services/sync.service';

@Injectable({ providedIn: 'root' })
export class InventoryFacade {
  readonly warehouses = signal<any[]>([]);
  get isOnline() {
    return this.syncService.isOnline;
  }

  constructor(
    private readonly database: DatabaseService,
    private readonly syncService: SyncService
  ) {}

  async initialize(): Promise<void> {
    if (!this.database.isReady()) {
      await this.database.init();
    }
    await this.loadWarehouses();
  }

  async refresh(): Promise<void> {
    if (this.isOnline()) {
      await this.syncService.downSync();
    }
    await this.loadWarehouses();
  }

  private async loadWarehouses(): Promise<void> {
    let warehouses = await this.database.getWarehouses();

    if (warehouses.length === 0 && this.isOnline()) {
      await this.syncService.downSync();
      warehouses = await this.database.getWarehouses();
    }

    this.warehouses.set(warehouses);
  }
}
