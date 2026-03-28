import { signal, computed } from '@angular/core';
import { AccountDto, JournalEntryDto } from '@virteex/domain-accounting-contracts';

export const accountingState = signal<{
  accounts: AccountDto[];
  journalEntries: JournalEntryDto[];
  isLoading: boolean;
  error: string | null;
}>({
  accounts: [],
  journalEntries: [],
  isLoading: false,
  error: null as string | null,
});

export const selectAccounts = computed(() => accountingState().accounts);
export const selectIsLoading = computed(() => accountingState().isLoading);
