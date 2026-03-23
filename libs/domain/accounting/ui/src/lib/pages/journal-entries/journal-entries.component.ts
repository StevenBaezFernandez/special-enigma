import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AccountingService } from '../../services/accounting.service';
import { JournalEntryDto } from '@virteex/domain-accounting-contracts';

@Component({
  selector: 'app-journal-entries',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Journal Entries</h1>
        <button routerLink="/accounting/journal-entries/new" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          + New Journal Entry
        </button>
      </div>

      <div *ngIf="loading" class="text-blue-500">Loading entries...</div>
      <div *ngIf="error" class="text-red-500 mb-4">{{ error }}</div>

      <div *ngIf="!loading && !error" class="bg-white rounded shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let entry of entries">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ entry.date | date }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ entry.reference }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ entry.description }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ entry.amount | currency }}</td>
            </tr>
            <tr *ngIf="entries.length === 0">
              <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">No journal entries found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class JournalEntriesComponent implements OnInit {
  private accountingService = inject(AccountingService);
  entries: JournalEntryDto[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    this.accountingService.getJournalEntries()
      .pipe(
        catchError(err => {
          this.error = 'Failed to load journal entries. Please try again later.';
          return of([]);
        })
      )
      .subscribe(data => {
        this.entries = data;
        this.loading = false;
      });
  }
}
