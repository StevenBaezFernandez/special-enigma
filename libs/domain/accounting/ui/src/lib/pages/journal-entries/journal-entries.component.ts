import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'virteex-journal-entries',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Journal Entries</h1>

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
  private http = inject(HttpClient);
  entries: any[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    this.http.get<any[]>('/api/accounting/journal-entries')
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
