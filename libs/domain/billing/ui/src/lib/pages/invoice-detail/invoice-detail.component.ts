import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'virteex-invoice-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div *ngIf="loading" class="text-blue-500">Loading invoice details...</div>
      <div *ngIf="error" class="text-red-500 mb-4">{{ error }}</div>

      <div *ngIf="!loading && !error && invoice" class="bg-white rounded shadow p-6 max-w-2xl mx-auto">
        <div class="flex justify-between border-b pb-4 mb-4">
          <h1 class="text-2xl font-bold">Invoice {{ invoice.number }}</h1>
          <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">{{ invoice.status }}</span>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h2 class="text-gray-500 uppercase text-xs font-bold">Bill To</h2>
            <p class="font-semibold">{{ invoice.customerName }}</p>
            <p class="text-sm text-gray-600">{{ invoice.customerAddress }}</p>
          </div>
          <div class="text-right">
            <h2 class="text-gray-500 uppercase text-xs font-bold">Date</h2>
            <p>{{ invoice.date | date }}</p>
            <h2 class="text-gray-500 uppercase text-xs font-bold mt-2">Due Date</h2>
            <p>{{ invoice.dueDate | date }}</p>
          </div>
        </div>

        <table class="min-w-full divide-y divide-gray-200 mb-6">
          <thead>
            <tr>
              <th class="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Description</th>
              <th class="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Qty</th>
              <th class="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Price</th>
              <th class="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr *ngFor="let item of invoice.items">
              <td class="px-4 py-3 text-sm">{{ item.description }}</td>
              <td class="px-4 py-3 text-sm text-right">{{ item.quantity }}</td>
              <td class="px-4 py-3 text-sm text-right">{{ item.price | currency }}</td>
              <td class="px-4 py-3 text-sm text-right">{{ (item.quantity * item.price) | currency }}</td>
            </tr>
          </tbody>
        </table>

        <div class="flex justify-end">
          <div class="w-64">
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-600">Subtotal</span>
              <span class="font-semibold">{{ invoice.subtotal | currency }}</span>
            </div>
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-600">Tax</span>
              <span class="font-semibold">{{ invoice.tax | currency }}</span>
            </div>
            <div class="flex justify-between py-3">
              <span class="text-lg font-bold">Total</span>
              <span class="text-lg font-bold">{{ invoice.total | currency }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class InvoiceDetailComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  invoice: any = null;
  loading = true;
  error = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid invoice ID.';
      this.loading = false;
      return;
    }

    this.http.get<any>(`/api/billing/invoices/${id}`)
      .pipe(
        catchError(err => {
          this.error = 'Failed to load invoice details.';
          return of(null);
        })
      )
      .subscribe(data => {
        this.invoice = data;
        this.loading = false;
      });
  }
}
