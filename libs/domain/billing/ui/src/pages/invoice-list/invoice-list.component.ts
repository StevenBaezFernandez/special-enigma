import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Invoices</h1>

      <div *ngIf="loading" class="text-blue-500">Loading invoices...</div>
      <div *ngIf="error" class="text-red-500 mb-4">{{ error }}</div>

      <div *ngIf="!loading && !error" class="bg-white rounded shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let invoice of invoices">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ invoice.number }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ invoice.date | date }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ invoice.customerName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ invoice.total | currency }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span [class.bg-green-100]="invoice.status === 'PAID'" [class.bg-yellow-100]="invoice.status === 'PENDING'" class="px-2 py-1 rounded-full text-xs">
                  {{ invoice.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <a [routerLink]="[invoice.id]" class="text-blue-600 hover:text-blue-900">View</a>
              </td>
            </tr>
            <tr *ngIf="invoices.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">No invoices found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class InvoiceListComponent implements OnInit {
  private http = inject(HttpClient);
  invoices  : any[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    this.http.get<any[]>('/api/billing/invoices')
      .pipe(
        catchError(err => {
          this.error = 'Failed to load invoices. Please try again later.';
          return of([]);
        })
      )
      .subscribe(data => {
        this.invoices = data;
        this.loading = false;
      });
  }
}
