import { Injectable, Inject, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@virteex/shared-config';

export interface TopProduct {
  name: string;
  value: number;
}

export interface InvoiceStatusSummary {
  paid: number;
  pending: number;
  overdue: number;
}

export interface ArAging {
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class BiService {
  private http = inject(HttpClient);

  constructor(@Inject(API_URL) private apiUrl: string) {}

  getTopProducts(tenantId: string = 'default'): Observable<TopProduct[]> {
    return this.http.get<TopProduct[]>(`${this.apiUrl}/bi/top-products?tenantId=${tenantId}`);
  }

  getInvoiceStatus(tenantId: string = 'default'): Observable<InvoiceStatusSummary> {
    return this.http.get<InvoiceStatusSummary>(`${this.apiUrl}/bi/invoice-status?tenantId=${tenantId}`);
  }

  getArAging(tenantId: string = 'default'): Observable<ArAging> {
    return this.http.get<ArAging>(`${this.apiUrl}/bi/ar-aging?tenantId=${tenantId}`);
  }

  getExpenses(tenantId: string = 'default'): Observable<ExpenseCategory[]> {
    return this.http.get<ExpenseCategory[]>(`${this.apiUrl}/bi/expenses?tenantId=${tenantId}`);
  }
}
