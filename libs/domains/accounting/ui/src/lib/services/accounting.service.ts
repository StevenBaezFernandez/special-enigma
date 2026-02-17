import { Injectable, Inject, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@virteex/shared-config';
import { Account } from '../models/account.model';
import { JournalEntry } from '../models/journal-entry.model';

@Injectable({
  providedIn: 'root',
})
export class AccountingService {
  private http = inject(HttpClient);

  constructor(@Inject(API_URL) private apiUrl: string) {}

  getAccounts(tenantId: string = 'default'): Observable<Account[]> {
    return this.http.get<Account[]>(
      `${this.apiUrl}/accounting/accounts?tenantId=${tenantId}`,
    );
  }

  getJournalEntries(tenantId: string = 'default'): Observable<JournalEntry[]> {
    return this.http.get<JournalEntry[]>(
      `${this.apiUrl}/accounting/journal-entries?tenantId=${tenantId}`,
    );
  }
}
