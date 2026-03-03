import { APP_CONFIG } from '@virteex/shared-config';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CustomerReceipt {
  id: string;
  receiptNumber: string;
  customerName: string;
  paymentDate: string;
  amount: number;
}

@Injectable({ providedIn: 'root' })
export class CustomerReceiptsService {
  private config = inject(APP_CONFIG);
  private http = inject(HttpClient);
  private apiUrl = `${this.config.apiUrl}/customer-payments`; // Assuming this is the new endpoint

  // Domain methods
  getReceipts(): Observable<CustomerReceipt[]> {
    return this.http.get<CustomerReceipt[]>(this.apiUrl);
  }
}
