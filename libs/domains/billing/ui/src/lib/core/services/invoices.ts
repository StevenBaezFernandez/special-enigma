import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { API_URL } from '@virteex/shared-config';

export interface Invoice {
  id: string;
  number: string;
  customerName: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Void';
}

export interface CreateInvoiceDto {
  customerId: string;
  issueDate: string;
  dueDate: string;
  paymentForm: string;
  paymentMethod: string;
  usage: string;
  notes?: string;
  items: {
      productId: string;
      quantity: number;
      unitPrice: number;
      description: string;
      taxRate: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class InvoicesService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/billing/invoices`);
  }

  createInvoice(invoice: CreateInvoiceDto): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/billing/invoices`, invoice);
  }
}
