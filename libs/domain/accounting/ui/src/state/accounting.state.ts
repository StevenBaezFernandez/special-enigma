import { signal, computed } from '@angular/core';
import { AccountDto, JournalEntryDto, FinancialReportDto } from '@virteex/domain-accounting-contracts';

export const accountsState = signal<{
  items: AccountDto[];
  isLoading: boolean;
  error: string | null;
}>({
  items: [],
  isLoading: false,
  error: null,
});

export const entriesState = signal<{
  items: JournalEntryDto[];
  isLoading: boolean;
  error: string | null;
}>({
  items: [],
  isLoading: false,
  error: null,
});

export const reportsState = signal<{
  data: FinancialReportDto | null;
  isLoading: boolean;
  error: string | null;
}>({
  data: null,
  isLoading: false,
  error: null,
});

export const selectAccounts = computed(() => accountsState().items);
export const selectIsAccountsLoading = computed(() => accountsState().isLoading);
export const selectAccountsError = computed(() => accountsState().error);

export const selectJournalEntries = computed(() => entriesState().items);
export const selectIsEntriesLoading = computed(() => entriesState().isLoading);
export const selectEntriesError = computed(() => entriesState().error);

export const selectIsReportsLoading = computed(() => reportsState().isLoading);
export const selectReportsError = computed(() => reportsState().error);
