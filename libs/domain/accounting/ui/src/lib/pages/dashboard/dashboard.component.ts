import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of, forkJoin } from 'rxjs';

@Component({
  selector: 'virteex-accounting-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Accounting Dashboard</h1>

      <div *ngIf="loading" class="text-blue-500">Loading dashboard data...</div>

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
          <p class="text-3xl">{{ stats.lastClosing || 'Never' }}</p>
        </div>
      </div>

      <div *ngIf="error" class="mt-4 text-red-500 text-sm">{{ error }}</div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  loading = true;
  error = '';
  stats = {
    totalAccounts: 0,
    pendingEntries: 0,
    lastClosing: ''
  };

  ngOnInit() {
    forkJoin({
      accounts: this.http.get<any[]>('/api/accounting/accounts').pipe(catchError(() => of([]))),
      entries: this.http.get<any[]>('/api/accounting/journal-entries').pipe(catchError(() => of([])))
    }).subscribe({
      next: (data) => {
        this.stats.totalAccounts = data.accounts.length;
        this.stats.pendingEntries = data.entries.filter(e => e.status === 'DRAFT' || e.status === 'Draft').length;
        this.stats.lastClosing = data.entries.length > 0 ? data.entries[0].date : '2026-03-01';
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load some dashboard metrics.';
        this.loading = false;
      }
    });
  }
}
