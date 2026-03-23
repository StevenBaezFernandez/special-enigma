import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, of, forkJoin } from 'rxjs';
import { AccountingService } from '../../services/accounting.service';
import { JournalEntryStatus } from '@virteex/domain-accounting-contracts';

@Component({
  selector: 'app-accounting-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Accounting Dashboard</h1>

      <div *ngIf="loading" class="text-blue-500">Loading dashboard data...</div>

      <div *ngIf="!loading && stats.totalAccounts === 0" class="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
        <p class="font-bold">Initial Setup Required</p>
        <p>No accounts found. Would you like to setup the default chart of accounts?</p>
        <button (click)="setupChart()" class="mt-2 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
          Setup Chart of Accounts
        </button>
      </div>

      <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white p-4 rounded shadow">
          <h2 class="font-semibold">Total Accounts</h2>
          <p class="text-3xl">{{ stats.totalAccounts }}</p>
        </div>
        <div class="bg-white p-4 rounded shadow">
          <h2 class="font-semibold">Pending Journal Entries</h2>
          <p class="text-3xl">{{ stats.pendingEntries }}</p>
        </div>
        <div class="bg-white p-4 rounded shadow">
          <h2 class="font-semibold">Last Closing</h2>
          <p class="text-3xl">{{ stats.lastClosing }}</p>
        </div>
      </div>

      <div *ngIf="error" class="mt-4 text-red-500 text-sm">{{ error }}</div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private accountingService = inject(AccountingService);
  loading = true;
  error = '';
  stats = {
    totalAccounts: 0,
    pendingEntries: 0,
    lastClosing: 'No closing found'
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    forkJoin({
      accounts: this.accountingService.getAccounts().pipe(catchError(() => of([]))),
      entries: this.accountingService.getJournalEntries().pipe(catchError(() => of([])))
    }).subscribe({
      next: (data) => {
        this.stats.totalAccounts = data.accounts.length;
    this.stats.pendingEntries = data.entries.filter(e =>
      e.status === JournalEntryStatus.DRAFT ||
      (e.status as any) === 'DRAFT' ||
      (e.status as any) === 'Draft'
    ).length;

        // Robust logic for last closing
        const closingEntry = data.entries.find(e =>
          (e as any).type === 'CLOSING'
        );
    this.stats.lastClosing = closingEntry ? closingEntry.date.toString() : 'No closing found';

        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load some dashboard metrics.';
        this.loading = false;
      }
    });
  }

  setupChart() {
    this.accountingService.setupChartOfAccounts().subscribe(() => {
      this.loadData();
    });
  }
}
