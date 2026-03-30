import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { useAccounting } from '../../hooks/use-accounting';

@Component({
  selector: 'app-fiscal-closing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Fiscal Period Closing</h1>

      <div class="bg-white p-6 rounded shadow mb-6">
        <p class="mb-4 text-gray-700">Closing a period will prevent any further journal entries from being recorded before the specified date.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Closing Date</label>
            <input type="date" [(ngModel)]="closingDate" class="mt-1 block w-full border rounded p-2" />
          </div>
          <div class="flex items-end">
            <button (click)="closePeriod()" [disabled]="loading" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full disabled:opacity-50">
              Close Period
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="text-blue-500">Processing fiscal closing...</div>
      <div *ngIf="error" class="text-red-500">{{ error }}</div>
      <div *ngIf="success" class="text-green-500">Fiscal period closed successfully.</div>
    </div>
  `,
})
export class FiscalClosingComponent {
  private accounting = useAccounting();
  closingDate = new Date().toISOString().split('T')[0];
  loading = false;
  error = '';
  success = false;

  async closePeriod() {
    if (!confirm('Are you sure you want to close this fiscal period? This action cannot be undone.')) {
        return;
    }

    this.loading = true;
    this.error = '';
    this.success = false;

    try {
      await this.accounting.closeFiscalPeriod(this.closingDate);
      this.success = true;
      this.loading = false;
    } catch (err: any) {
      this.error = 'Failed to close fiscal period. ' + (err.error?.message || err.message || '');
      this.loading = false;
    }
  }
}
