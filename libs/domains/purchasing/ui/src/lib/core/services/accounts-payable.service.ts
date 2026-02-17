import { Injectable, Inject, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@virteex/shared-config';

export interface VendorBillLineItem {
  description: string;
  quantity: number;
  price: number;
  expenseAccountId: string;
}

export interface CreateVendorBillDto {
  supplierId: string;
  billNumber: string;
  issueDate: string;
  dueDate: string;
  notes?: string;
  lineItems: VendorBillLineItem[];
}

export interface UpdateVendorBillDto extends Partial<CreateVendorBillDto> {}

export interface VendorBill {
  id: string;
  supplierId: string;
  billNumber: string;
  issueDate: string;
  dueDate: string;
  notes?: string;
  lineItems: VendorBillLineItem[];
  totalAmount: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountsPayableService {
  private http = inject(HttpClient);

  constructor(@Inject(API_URL) private apiUrl: string) {}

  getVendorBillById(id: string): Observable<VendorBill> {
    return this.http.get<VendorBill>(`${this.apiUrl}/purchasing/bills/${id}`);
  }

  createVendorBill(dto: CreateVendorBillDto): Observable<VendorBill> {
    return this.http.post<VendorBill>(`${this.apiUrl}/purchasing/bills`, dto);
  }

  updateVendorBill(id: string, dto: UpdateVendorBillDto): Observable<VendorBill> {
    return this.http.put<VendorBill>(`${this.apiUrl}/purchasing/bills/${id}`, dto);
  }
}
