import { Injectable, Inject, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@virteex/shared-config';

export interface FiscalStats {
  taxesPayable: number;
  pendingDeclarations: number;
  nextDueDate: string;
  status: 'OK' | 'WARNING' | 'CRITICAL';
}

export interface TaxRule {
  id: string;
  name: string;
  rate: number;
  type: string;
  appliesTo: string;
}

@Injectable({
  providedIn: 'root'
})
export class FiscalService {
  private http = inject(HttpClient);

  constructor(@Inject(API_URL) private apiUrl: string) {}

  getStats(tenantId: string = 'default'): Observable<FiscalStats> {
    return this.http.get<FiscalStats>(`${this.apiUrl}/fiscal/stats?tenantId=${tenantId}`);
  }

  getTaxRules(tenantId: string = 'default'): Observable<TaxRule[]> {
    return this.http.get<TaxRule[]>(`${this.apiUrl}/fiscal/tax-rules?tenantId=${tenantId}`);
  }
}
