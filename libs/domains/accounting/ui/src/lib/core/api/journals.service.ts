import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@virteex/shared-config';
import { Journal } from '../models/journal.model';

@Injectable({
  providedIn: 'root'
})
export class JournalsService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  getJournals(): Observable<Journal[]> {
    return this.http.get<Journal[]>(`${this.apiUrl}/accounting/journals`);
  }
}
