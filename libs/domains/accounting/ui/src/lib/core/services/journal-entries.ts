import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JournalEntries {
  private http = inject(HttpClient);
  private apiUrl = '/api/accounting/journal-entries';

  getEntries(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
