import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@virteex/shared-config';

export interface Product {
  id: number;
  sku: string;
  name: string;
  price: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private apiUrl = inject(API_URL);
  private http = inject(HttpClient);

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/catalog/products`);
  }

  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/catalog/products`, product);
  }
}
