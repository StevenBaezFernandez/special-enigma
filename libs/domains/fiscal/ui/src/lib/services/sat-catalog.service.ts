import { inject, Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@virteex/shared-config';

export interface SatCatalogItem {
  code: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class SatCatalogService {
  private http = inject(HttpClient);

  constructor(@Inject(API_URL) private apiUrl: string) {}

  getPaymentForms(): Observable<SatCatalogItem[]> {
    return this.http.get<SatCatalogItem[]>(`${this.apiUrl}/catalog/sat/payment-forms`);
  }

  getPaymentMethods(): Observable<SatCatalogItem[]> {
    return this.http.get<SatCatalogItem[]>(`${this.apiUrl}/catalog/sat/payment-methods`);
  }

  getCfdiUsages(): Observable<SatCatalogItem[]> {
    return this.http.get<SatCatalogItem[]>(`${this.apiUrl}/catalog/sat/cfdi-usages`);
  }
}
