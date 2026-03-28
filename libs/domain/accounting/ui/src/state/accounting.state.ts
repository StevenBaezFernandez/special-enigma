import { signal, computed } from '@angular/core';

export const accountingState = signal({
  accounts: [],
  journalEntries: [],
  isLoading: false,
  error: null as string | null,
});

export const selectAccounts = computed(() => accountingState().accounts);
export const selectIsLoading = computed(() => accountingState().isLoading);
