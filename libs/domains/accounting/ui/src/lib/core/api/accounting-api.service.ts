import { APP_CONFIG } from '@virteex/shared-config';
// app/core/api/accounting.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Account } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountingApiService {
  private config = inject(APP_CONFIG);
  private http = inject(HttpClient);
  private apiUrl = `${this.config.apiUrl}/chart-of-accounts`;

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(this.apiUrl);
  }
}