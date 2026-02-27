import { APP_CONFIG } from '@virteex/shared-config';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Product } from '../models/product.model';

// DTOs que coinciden con el backend
export type CreateProductDto = Omit<Product, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>;
export type UpdateProductDto = Partial<CreateProductDto>;

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private config = inject(APP_CONFIG);
  private http = inject(HttpClient);
  private apiUrl = `${this.config.apiUrl}/inventory`;

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

}