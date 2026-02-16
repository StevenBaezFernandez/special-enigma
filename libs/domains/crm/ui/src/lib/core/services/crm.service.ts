import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@virteex/shared-ui';
import { Product } from '../models/product.model';
import { Sale, CreateSaleDto } from '../models/sale.model';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CrmService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  createSale(payload: CreateSaleDto): Observable<Sale> {
    return this.http.post<Sale>(`${this.apiUrl}/crm/sales`, payload);
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/catalog/products`);
  }

  getSales(tenantId: string = 'default'): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${this.apiUrl}/crm/sales?tenantId=${tenantId}`);
  }

  approveSale(id: string): Observable<Sale> {
    return this.http.post<Sale>(`${this.apiUrl}/crm/sales/${id}/approve`, {});
  }

  completeSale(id: string): Observable<Sale> {
    return this.http.post<Sale>(`${this.apiUrl}/crm/sales/${id}/complete`, {});
  }

  getCustomers(tenantId: string = 'default'): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/crm/customers?tenantId=${tenantId}`);
  }

  getTaxRate(tenantId: string = 'default'): Observable<{ rate: number }> {
    return this.http.get<{ rate: number }>(`${this.apiUrl}/fiscal/tax-rate?tenantId=${tenantId}`);
  }
}
