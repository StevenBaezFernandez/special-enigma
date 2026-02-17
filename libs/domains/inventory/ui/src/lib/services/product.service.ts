import { Injectable, Inject, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@virteex/shared-config';

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: string;
  fiscalCode?: string;
  taxGroup?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);

  constructor(@Inject(API_URL) private apiUrl: string) {}

  getProducts(tenantId: string = 'default'): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/catalog/products?tenantId=${tenantId}`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/catalog/products`, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/catalog/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/catalog/products/${id}`);
  }
}
