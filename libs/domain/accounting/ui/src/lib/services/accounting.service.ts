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

  createAccount(dto: any): Observable<AccountDto> {
    return this.http.post<AccountDto>('/api/accounting/accounts', dto);
  }

  recordJournalEntry(dto: any): Observable<JournalEntryDto> {
    return this.http.post<JournalEntryDto>('/api/accounting/journal-entries', dto);
  }

  setupChartOfAccounts(): Observable<void> {
    return this.http.post<void>('/api/accounting/setup', {});
  }

  getFinancialReport(type: string, endDate: string): Observable<any> {
    return this.http.get<any>(`/api/accounting/reports/financial?type=${type}&endDate=${endDate}`);
  }

  closeFiscalPeriod(closingDate: string): Observable<void> {
    return this.http.post<void>('/api/accounting/closing', { closingDate });
  }
}
