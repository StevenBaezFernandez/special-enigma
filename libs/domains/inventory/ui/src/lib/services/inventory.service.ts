import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  tenantId: string;
  description?: string;
  isActive?: boolean;
}

export interface RegisterMovementDto {
  productId: string;
  warehouseId: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT'; // InventoryMovementType
  quantity: string;
  reference: string;
  locationId?: string;
  tenantId?: string; // Optional as backend might infer from token, but DTO allows it
}

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private http = inject(HttpClient);
  // Robust config access
  private get apiUrl(): string {
    return (window as any).env?.apiUrl || 'http://localhost:3333/api';
  }

  getWarehouses(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(`${this.apiUrl}/inventory/warehouses`);
  }

  getWarehouse(id: string): Observable<Warehouse> {
    return this.http.get<Warehouse>(`${this.apiUrl}/inventory/warehouses/${id}`);
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

  registerMovement(movement: RegisterMovementDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventory/movements`, movement);
  }

  checkStock(warehouseId: string, productSku: string, quantity: number): Observable<{ available: boolean }> {
      return this.http.get<{ available: boolean }>(`${this.apiUrl}/inventory/check/${warehouseId}/${productSku}?quantity=${quantity}`);
  }
}
