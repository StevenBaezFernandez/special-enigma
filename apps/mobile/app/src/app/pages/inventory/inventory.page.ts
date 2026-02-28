import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ViewDidEnter, RefresherEventDetail } from '@ionic/angular';
import { InventoryFacade } from './services/inventory.facade';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './inventory.page.html',
  styleUrl: './inventory.page.scss',
})
export class InventoryPage implements ViewDidEnter {
  readonly facade = inject(InventoryFacade);

  get warehouses() {
    return this.facade.warehouses();
  }

  async ionViewDidEnter() {
    await this.facade.initialize();
  }

  async refresh(event: CustomEvent<RefresherEventDetail>) {
    await this.facade.refresh();
    event.detail.complete();
  }
}
