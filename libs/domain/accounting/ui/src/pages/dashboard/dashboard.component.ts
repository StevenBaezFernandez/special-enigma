import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JournalEntryStatus, JournalEntryType } from '@virteex/domain-accounting-contracts';
import { useAccounting } from '../../hooks/use-accounting';
import { selectAccounts, selectJournalEntries, selectIsAccountsLoading, selectIsEntriesLoading, selectAccountsError, selectEntriesError } from '../../state/accounting.state';

@Component({
  selector: 'app-accounting-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Accounting Dashboard</h1>

      <div *ngIf="loading()" class="text-blue-500">Loading dashboard data...</div>

      <div *ngIf="!loading() && stats().totalAccounts === 0" class="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
        <p class="font-bold">Initial Setup Required</p>
        <p>No accounts found. Would you like to setup the default chart of accounts?</p>
        <button (click)="setupChart()" class="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
          Setup Chart of Accounts
        </button>
      </div>

      <div *ngIf="!loading()" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white p-4 rounded shadow">
          <h2 class="font-semibold">Total Accounts</h2>
          <p class="text-3xl">{{ stats().totalAccounts }}</p>
        </div>
        <div class="bg-white p-4 rounded shadow">
          <h2 class="font-semibold">Pending Journal Entries</h2>
          <p class="text-3xl">{{ stats().pendingEntries }}</p>
        </div>
        <div class="bg-white p-4 rounded shadow">
          <h2 class="font-semibold">Last Closing</h2>
          <p class="text-3xl">{{ stats().lastClosing }}</p>
        </div>
      </div>

      <div *ngIf="error()" class="mt-4 text-red-500 text-sm">{{ error() }}</div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private accounting = useAccounting();

  accounts = selectAccounts;
  entries = selectJournalEntries;
  isAccountsLoading = selectIsAccountsLoading;
  isEntriesLoading = selectIsEntriesLoading;

  loading = computed(() => this.isAccountsLoading() || this.isEntriesLoading());
  error = computed(() => selectAccountsError() || selectEntriesError());

  stats = computed(() => {
    const accounts = this.accounts();
    const entries = this.entries();

    const pendingEntries = entries.filter(e => e.status === JournalEntryStatus.DRAFT).length;

    const closingEntries = entries
      .filter(e => e.type === JournalEntryType.CLOSING)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const latestClosing = closingEntries.length > 0 ? closingEntries[0] : null;
    const lastClosing = latestClosing ? new Date(latestClosing.date).toLocaleDateString() : 'No closing found';

    return {
      totalAccounts: accounts.length,
      pendingEntries,
      lastClosing
    };
  });

  ngOnInit() {
    this.accounting.loadAccounts();
    this.accounting.loadJournalEntries();
  }

  setupChart() {
    this.accounting.setupChartOfAccounts();
  }
}
