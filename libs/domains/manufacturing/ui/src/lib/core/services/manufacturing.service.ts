import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@virteex/shared-config';

export interface ProductionOrder {
  id: string;
  productSku: string;
  quantity: number;
  status: string;
  dueDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ManufacturingService {
  private apiUrl = inject(API_URL);
  private http = inject(HttpClient);

  getOrders(): Observable<ProductionOrder[]> {
    return this.http.get<ProductionOrder[]>(`${this.apiUrl}/manufacturing/orders`);
  }
}
