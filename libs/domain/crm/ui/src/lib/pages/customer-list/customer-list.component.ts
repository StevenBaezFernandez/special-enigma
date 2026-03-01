import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'virteex-customer-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Customers</h1>

      <div *ngIf="loading" class="text-blue-500">Loading customers...</div>
      <div *ngIf="error" class="text-red-500 mb-4">{{ error }}</div>

      <div *ngIf="!loading && !error" class="bg-white rounded shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let customer of customers">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ customer.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ customer.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ customer.company }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ customer.totalSales | currency }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button class="text-blue-600 hover:text-blue-900">View</button>
              </td>
            </tr>
            <tr *ngIf="customers.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">No customers found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class CustomerListComponent implements OnInit {
  private http = inject(HttpClient);
  customers: any[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    this.http.get<any[]>('/api/crm/customers')
      .pipe(
        catchError(err => {
          this.error = 'Failed to load customers.';
          return of([]);
        })
      )
      .subscribe(data => {
        this.customers = data;
        this.loading = false;
      });
  }
}
