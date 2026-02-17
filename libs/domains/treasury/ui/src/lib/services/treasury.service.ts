import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@virteex/shared-config';
import { BankAccountDto, CreateBankAccountDto } from '@virteex/treasury-contracts';

@Injectable({
  providedIn: 'root',
})
export class TreasuryService {
  constructor(@Inject(API_URL) private apiUrl: string, private http: HttpClient) {}

  getBankAccounts(tenantId: string = 'default'): Observable<BankAccountDto[]> {
    return this.http.get<BankAccountDto[]>(`${this.apiUrl}/treasury/bank-accounts?tenantId=${tenantId}`);
  }

  createBankAccount(dto: CreateBankAccountDto): Observable<BankAccountDto> {
    return this.http.post<BankAccountDto>(`${this.apiUrl}/treasury/bank-accounts`, dto);
  }
}
