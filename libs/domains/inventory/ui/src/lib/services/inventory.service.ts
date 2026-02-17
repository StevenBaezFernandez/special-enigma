import { Injectable, Inject, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@virteex/shared-config';

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  description?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private http = inject(HttpClient);

  constructor(@Inject(API_URL) private apiUrl: string) {}

  getWarehouses(tenantId: string = 'default'): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(
      `${this.apiUrl}/inventory/warehouses?tenantId=${tenantId}`,
    );
  }

  createWarehouse(warehouse: Partial<Warehouse>): Observable<Warehouse> {
    return this.http.post<Warehouse>(`${this.apiUrl}/inventory/warehouses`, warehouse);
  }

  updateWarehouse(id: string, warehouse: Partial<Warehouse>): Observable<Warehouse> {
    return this.http.put<Warehouse>(`${this.apiUrl}/inventory/warehouses/${id}`, warehouse);
  }

  deleteWarehouse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/inventory/warehouses/${id}`);
  }
}
