import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CatalogService, Product } from '../../core/services/catalog.service';

export interface ProductItem extends Product {
  status: string;
}

@Component({
  selector: 'virteex-catalog-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
  private catalogService = inject(CatalogService);
  public router = inject(Router);
  items: ProductItem[] = [];

  ngOnInit() {
    this.catalogService.getProducts().subscribe((products) => {
      this.items = products.map((p) => ({
        ...p,
        status: p.isActive ? 'Active' : 'Inactive',
      }));
    });
  }
}
