import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BankAccountDto, CreateBankAccountDto } from '@virteex/contracts-treasury-contracts';
import { GraphQLClientService } from '@virteex/shared-util-http';

@Injectable({
  providedIn: 'root',
})
export class TreasuryService {
  private gql = inject(GraphQLClientService);

  getBankAccounts(tenantId: string = 'default'): Observable<BankAccountDto[]> {
    const query = `
      query GetBankAccounts {
        bankAccounts {
          id
          name
          accountNumber
          bankName
          currency
          balance
        }
      }
    `;
    return this.gql.query<{ bankAccounts: BankAccountDto[] }>(query).pipe(
      map(res => res.bankAccounts)
    );
  }

  createBankAccount(dto: CreateBankAccountDto): Observable<BankAccountDto> {
    const input = {
      name: dto.name,
      accountNumber: dto.accountNumber,
      bankName: dto.bankName,
      currency: dto.currency
    };

    const mutation = `
      mutation CreateBankAccount($input: CreateBankAccountInput!) {
        createBankAccount(input: $input) {
          id
          name
          accountNumber
          bankName
          currency
          balance
        }
      }
    `;
    return this.gql.mutate<{ createBankAccount: BankAccountDto }>(mutation, { input }).pipe(
      map(res => res.createBankAccount)
    );
  }
}
