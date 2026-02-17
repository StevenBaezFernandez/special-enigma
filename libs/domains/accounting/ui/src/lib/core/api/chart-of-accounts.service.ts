import { Injectable, Inject, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@virteex/shared-config';
import { Account } from '../models/account.model';

export type CreateAccountDto = Omit<Account, 'id'>;
export type UpdateAccountDto = Partial<CreateAccountDto>;

@Injectable({
  providedIn: 'root',
})
export class ChartOfAccountsApiService {
  private http = inject(HttpClient);
  constructor(@Inject(API_URL) private apiUrl: string) {}

  getAccounts(tenantId: string = 'default'): Observable<Account[]> {
    return this.http.get<Account[]>(
      `${this.apiUrl}/accounting/accounts?tenantId=${tenantId}`,
    );
  }

  getAccountById(id: string): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/accounting/accounts/${id}`);
  }

  createAccount(dto: CreateAccountDto): Observable<Account> {
    return this.http.post<Account>(`${this.apiUrl}/accounting/accounts`, dto);
  }

  updateAccount(id: string, dto: UpdateAccountDto): Observable<Account> {
    return this.http.put<Account>(
      `${this.apiUrl}/accounting/accounts/${id}`,
      dto,
    );
  }

  deleteAccount(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/accounting/accounts/${id}`);
  }
}
