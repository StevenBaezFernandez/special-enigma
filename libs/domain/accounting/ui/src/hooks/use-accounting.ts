import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AccountingService } from '../services/accounting.service';
import { accountingState } from '../state/accounting.state';

export function useAccounting() {
  const service = inject(AccountingService);

  async function loadAccounts() {
    accountingState.update(s => ({ ...s, isLoading: true }));
    try {
      const accounts = await firstValueFrom(service.getAccounts());
      accountingState.update(s => ({ ...s, accounts: accounts || [], isLoading: false }));
    } catch (e) {
      accountingState.update(s => ({ ...s, error: (e as Error).message, isLoading: false }));
    }
  }

  return {
    loadAccounts,
  };
}
