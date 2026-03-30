import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AccountDto,
  JournalEntryDto,
  CreateAccountDto,
  RecordJournalEntryDto,
  FinancialReportDto
} from '@virteex/domain-accounting-contracts';

@Injectable({
  providedIn: 'root'
})
export class AccountingService {
  private readonly http = inject(HttpClient);

  getAccounts(): Observable<AccountDto[]> {
    return this.http.get<AccountDto[]>('/api/accounting/accounts');
  }

  getJournalEntries(): Observable<JournalEntryDto[]> {
    return this.http.get<JournalEntryDto[]>('/api/accounting/journal-entries');
  }

  createAccount(dto: CreateAccountDto): Observable<AccountDto> {
    return this.http.post<AccountDto>('/api/accounting/accounts', dto);
  }

  recordJournalEntry(dto: RecordJournalEntryDto): Observable<JournalEntryDto> {
    return this.http.post<JournalEntryDto>('/api/accounting/journal-entries', dto);
  }

  setupChartOfAccounts(): Observable<void> {
    return this.http.post<void>('/api/accounting/setup', {});
  }

  getFinancialReport(type: string, endDate: string, dimensions?: Record<string, string>): Observable<FinancialReportDto> {
    const params: Record<string, string> = { type, endDate };
    if (dimensions) {
      params['dimensions'] = JSON.stringify(dimensions);
    }
    return this.http.get<FinancialReportDto>(`/api/accounting/reports/financial`, { params });
  }

  closeFiscalPeriod(closingDate: string): Observable<void> {
    return this.http.post<void>('/api/accounting/closing', { closingDate });
  }
}
