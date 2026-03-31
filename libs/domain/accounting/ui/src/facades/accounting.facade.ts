import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CreateAccountDto, RecordJournalEntryDto } from '@virteex/domain-accounting-contracts';
import { AccountingService } from '../services/accounting.service';
import { mapAccountingError } from '../utils/error-mapper';
import {
  accountsState,
  entriesState,
  reportsState,
  selectAccounts,
  selectIsAccountsLoading,
  selectAccountsError,
  selectJournalEntries,
  selectIsEntriesLoading,
  selectEntriesError,
  selectIsReportsLoading,
  selectReportsError
} from '../state/accounting.state';

export function accountingFacade() {
  const service = inject(AccountingService);

  async function loadAccounts() {
    accountsState.update(s => ({ ...s, isLoading: true, error: null }));
    try {
      const accounts = await firstValueFrom(service.getAccounts());
      accountsState.update(s => ({ ...s, items: accounts || [], isLoading: false }));
    } catch (e) {
      accountsState.update(s => ({ ...s, error: mapAccountingError(e), isLoading: false }));
    }
  }

  async function loadJournalEntries() {
    entriesState.update(s => ({ ...s, isLoading: true, error: null }));
    try {
      const entries = await firstValueFrom(service.getJournalEntries());
      entriesState.update(s => ({ ...s, items: entries || [], isLoading: false }));
    } catch (e) {
      entriesState.update(s => ({ ...s, error: mapAccountingError(e), isLoading: false }));
    }
  }

  async function generateReport(type: string, endDate: string, dimensions?: Record<string, string>) {
    reportsState.update(s => ({ ...s, isLoading: true, error: null }));
    try {
      const report = await firstValueFrom(service.getFinancialReport(type, endDate, dimensions));
      reportsState.update(s => ({ ...s, data: report, isLoading: false }));
    } catch (e) {
      reportsState.update(s => ({ ...s, error: mapAccountingError(e), isLoading: false }));
    }
  }

  async function closeFiscalPeriod(closingDate: string) {
    await firstValueFrom(service.closeFiscalPeriod(closingDate));
    return true;
  }

  async function createAccount(dto: CreateAccountDto) {
    const account = await firstValueFrom(service.createAccount(dto));
    accountsState.update(s => ({ ...s, items: [...s.items, account] }));
    return account;
  }

  async function setupChartOfAccounts() {
    try {
      await firstValueFrom(service.setupChartOfAccounts());
      await loadAccounts();
    } catch (e) {
        accountsState.update(s => ({ ...s, error: mapAccountingError(e) }));
    }
  }

  async function recordJournalEntry(dto: RecordJournalEntryDto) {
    const entry = await firstValueFrom(service.recordJournalEntry(dto));
    entriesState.update(s => ({ ...s, items: [entry, ...s.items] }));
    return entry;
  }

  return {
    // State (Selectors)
    accounts: selectAccounts,
    isAccountsLoading: selectIsAccountsLoading,
    accountsError: selectAccountsError,
    entries: selectJournalEntries,
    isEntriesLoading: selectIsEntriesLoading,
    entriesError: selectEntriesError,
    reportData: () => reportsState().data,
    isReportsLoading: selectIsReportsLoading,
    reportsError: selectReportsError,

    // Actions
    loadAccounts,
    loadJournalEntries,
    generateReport,
    closeFiscalPeriod,
    createAccount,
    setupChartOfAccounts,
    recordJournalEntry
  };
}
