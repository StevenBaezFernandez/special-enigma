import { inject } from '@angular/core';
import { AccountingService } from '../services/accounting.service';
import { accountingState } from '../state/accounting.state';

export function useAccounting() {
  const service = inject(AccountingService);

  async function loadAccounts(tenantId: string) {
    accountingState.update(s => ({ ...s, isLoading: true }));
    try {
      const accounts = await service.getAccounts(tenantId).toPromise();
      accountingState.update(s => ({ ...s, accounts, isLoading: false }));
    } catch (e) {
      accountingState.update(s => ({ ...s, error: (e as Error).message, isLoading: false }));
    }
  }

  return {
    loadAccounts,
  };
}
