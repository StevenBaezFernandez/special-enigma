import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ViewDidEnter, RefresherEventDetail } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Inventario</ion-title>
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
           <p>No se encontraron almacenes.</p>
        </div>
      </ion-list>
    </ion-content>
  `
})
export class InventoryPage implements ViewDidEnter {
  private http = inject(HttpClient);
  warehouses: any[] = [];

  // TODO: Use Env injection token
  private apiUrl = 'http://localhost:3333/api';

  async ionViewDidEnter() {
    await this.loadData();
  }

  async loadData() {
    try {
      this.warehouses = await firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/inventory/warehouses`));
    } catch (e) {
      console.error('Failed to load warehouses', e);
    }
  }

  async refresh(event: CustomEvent<RefresherEventDetail>) {
    await this.loadData();
    event.detail.complete();
  }
}
