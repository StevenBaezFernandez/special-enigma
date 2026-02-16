import { APP_CONFIG } from '@virteex/shared-config';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SatCatalogItem {
  code: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class SatCatalogService {
  private config = inject(APP_CONFIG);
  private http = inject(HttpClient);
  private apiUrl = `${this.config.apiUrl}/catalog/sat`;

  getPaymentForms(): Observable<SatCatalogItem[]> {
    return this.http.get<SatCatalogItem[]>(`${this.apiUrl}/payment-forms`);
  }

  getPaymentMethods(): Observable<SatCatalogItem[]> {
    return this.http.get<SatCatalogItem[]>(`${this.apiUrl}/payment-methods`);
  }

  getCfdiUsages(): Observable<SatCatalogItem[]> {
    return this.http.get<SatCatalogItem[]>(`${this.apiUrl}/cfdi-usages`);
  }
}
