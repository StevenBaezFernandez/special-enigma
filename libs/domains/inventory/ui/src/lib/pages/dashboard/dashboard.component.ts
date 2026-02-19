import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InventoryService, Warehouse } from '../../services/inventory.service';

@Component({
  selector: 'virteex-inventory-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  warehouses = signal<Warehouse[]>([]);
  totalWarehouses = signal<number>(0);

  ngOnInit() {
    this.inventoryService.getWarehouses().subscribe({
      next: (data) => {
        this.warehouses.set(data);
        this.totalWarehouses.set(data.length);
      },
      error: (err) => console.error('Failed to load dashboard data', err),
    });
  }
}
