import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@virteex/shared-config';
import { Ledger } from '../models/ledger.model';

export type CreateLedgerDto = Omit<Ledger, 'id' | 'status'>;
export type UpdateLedgerDto = Partial<CreateLedgerDto>;

@Injectable({
  providedIn: 'root'
})
export class LedgersService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  getLedgers(): Observable<Ledger[]> {
    return this.http.get<Ledger[]>(`${this.apiUrl}/accounting/ledgers`);
  }

  getLedgerById(id: string): Observable<Ledger> {
    return this.http.get<Ledger>(`${this.apiUrl}/accounting/ledgers/${id}`);
  }

  createLedger(dto: CreateLedgerDto): Observable<Ledger> {
    return this.http.post<Ledger>(`${this.apiUrl}/accounting/ledgers`, dto);
  }

  updateLedger(id: string, dto: UpdateLedgerDto): Observable<Ledger> {
    return this.http.put<Ledger>(`${this.apiUrl}/accounting/ledgers/${id}`, dto);
  }
}
