import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountDto, JournalEntryDto } from '@virteex/domain-accounting-contracts';

@Injectable({
  providedIn: 'root'
})
export class AccountingService {
  private http = inject(HttpClient);

  getAccounts(): Observable<AccountDto[]> {
    return this.http.get<AccountDto[]>('/api/accounting/accounts');
  }

  getJournalEntries(): Observable<JournalEntryDto[]> {
    return this.http.get<JournalEntryDto[]>('/api/accounting/journal-entries');
  }
}
