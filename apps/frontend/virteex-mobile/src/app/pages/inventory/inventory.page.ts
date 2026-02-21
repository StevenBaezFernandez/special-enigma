import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ViewDidEnter, RefresherEventDetail } from '@ionic/angular';
import { DatabaseService } from '../../core/services/database.service';
import { SyncService } from '../../core/services/sync.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Inventario (Offline First)</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-list>
        <ion-item *ngFor="let w of warehouses">
          <ion-label>
            <h2>{{ w.name }}</h2>
            <p>{{ w.code }} - {{ w.location }}</p>
          </ion-label>
          <ion-badge slot="end" color="success">Activo</ion-badge>
        </ion-item>

        <div *ngIf="warehouses.length === 0" class="ion-text-center ion-padding">
           <p>No se encontraron almacenes localmente.</p>
           <p *ngIf="isOnline()">Desliza para sincronizar.</p>
           <p *ngIf="!isOnline()">Sin conexión.</p>
        </div>
      </ion-list>
    </ion-content>
  `
})
export class InventoryPage implements ViewDidEnter {
  private database = inject(DatabaseService);
  private sync = inject(SyncService);

  warehouses: any[] = [];

  // Expose signal for template
  get isOnline() {
      return this.sync.isOnline;
  }

  async ionViewDidEnter() {
    // Ensure DB is initialized
    if (!this.database.isReady()) {
        await this.database.init();
    }
    await this.loadData();
  }

  async loadData() {
    try {
      this.warehouses = await this.database.getWarehouses();

      // If empty and online, try auto-sync once (implicit)
      if (this.warehouses.length === 0 && this.sync.isOnline()) {
           console.log('Local DB empty, triggering auto down-sync...');
           await this.sync.downSync();
           this.warehouses = await this.database.getWarehouses();
      }
    } catch (e) {
      console.error('Failed to load warehouses from DB', e);
    }
  }

  async refresh(event: CustomEvent<RefresherEventDetail>) {
    if (this.sync.isOnline()) {
        await this.sync.downSync();
        await this.loadData();
    }
    event.detail.complete();
  }
}
