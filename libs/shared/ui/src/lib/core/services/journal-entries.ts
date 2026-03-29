import { APP_CONFIG } from '@virteex/shared-config';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JournalEntry } from '@virteex/domain-accounting-contracts';

type CreateJournalEntryDto = Omit<JournalEntry, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'totalDebit' | 'totalCredit' | 'status'>;

/**
 * @deprecated Use AccountingService from @virteex/accounting-ui instead.
 */
@Injectable({
  providedIn: 'root'
})
export class JournalEntries {
  private config = inject(APP_CONFIG) as any;
  private http = inject(HttpClient);
  private apiUrl = `${this.config.apiUrl}/journal-entries`;

  constructor() {
    console.warn('JournalEntries service is deprecated. Use AccountingService from @virteex/accounting-ui instead.');
  }

  getAll(): Observable<JournalEntry[]> {
    return this.http.get<JournalEntry[]>(this.apiUrl);
  }

  getById(id: string): Observable<JournalEntry> {
    return this.http.get<JournalEntry>(`${this.apiUrl}/${id}`);
  }

  create(entry: CreateJournalEntryDto): Observable<JournalEntry> {
    return this.http.post<JournalEntry>(this.apiUrl, entry);
  }

  previewImport(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<any>(`${this.apiUrl}/import/preview`, formData);
  }

  confirmImport(batchId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/import/confirm`, { batchId });
  }
}
