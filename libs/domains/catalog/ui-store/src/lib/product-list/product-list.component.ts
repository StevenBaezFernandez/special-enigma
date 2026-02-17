import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'virteex-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent {
  products = [
    { id: 1, name: 'Industrial Robot Arm', price: 25000 },
    { id: 2, name: 'Conveyor Belt System', price: 12000 },
    { id: 3, name: 'CNC Machine', price: 45000 },
    { id: 4, name: 'Forklift', price: 18000 },
  ];
}
