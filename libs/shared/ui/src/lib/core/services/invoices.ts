import { APP_CONFIG } from '@virteex/shared-config';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerAddress: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Pending' | 'Paid' | 'Partially Paid' | 'Void' | 'Credit Note';
  lineItems: InvoiceLineItem[];
  notes?: string;
  originalInvoiceId?: string;
}

// DTO ya no incluye totales, se calculan en backend
export interface CreateInvoiceDto {
    customerId: string;
    // Fields below might be ignored by current backend implementation but kept for UI state if needed
    issueDate?: string;
    dueDate?: string;
    notes?: string;
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        description: string;
    }[];
}

@Injectable({ providedIn: 'root' })
export class InvoicesService {
  private config = inject(APP_CONFIG);
  private http = inject(HttpClient);
  private apiUrl = `${this.config.apiUrl}/invoices`;

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl);
  }

  getInvoiceById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  createInvoice(invoiceData: CreateInvoiceDto): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoiceData);
  }

  createCreditNote(invoiceId: string): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/${invoiceId}/credit-note`, {});
  }

  downloadInvoicePdf(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}