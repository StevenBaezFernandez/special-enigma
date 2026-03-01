import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

@Component({
  selector: 'virteex-chart-of-accounts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Chart of Accounts</h1>

      <div *ngIf="loading" class="text-blue-500">Loading accounts...</div>
      <div *ngIf="error" class="text-red-500 mb-4">{{ error }}</div>

      <div *ngIf="!loading && !error" class="bg-white rounded shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let account of accounts">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ account.code }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ account.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ account.type }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ account.balance | currency }}</td>
            </tr>
            <tr *ngIf="accounts.length === 0">
              <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">No accounts found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ChartOfAccountsComponent implements OnInit {
  private http = inject(HttpClient);
  accounts: any[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    this.http.get<any[]>('/api/accounting/accounts')
      .pipe(
        catchError(err => {
          this.error = 'Failed to load accounts. Please try again later.';
          return of([]);
        })
      )
      .subscribe(data => {
        this.accounts = data;
        this.loading = false;
      });
  }
}
