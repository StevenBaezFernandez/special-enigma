import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { useAccounting } from '../../hooks/use-accounting';
import { selectIsReportsLoading, selectReportsError, reportsState } from '../../state/accounting.state';

@Component({
  selector: 'app-financial-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Financial Reports</h1>

      <div class="bg-white p-6 rounded shadow mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Report Type</label>
            <select [(ngModel)]="reportType" class="mt-1 block w-full border rounded p-2">
              <option value="BALANCE_SHEET">Balance Sheet</option>
              <option value="PROFIT_AND_LOSS">Profit & Loss</option>
              <option value="TRIAL_BALANCE">Trial Balance</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">End Date</label>
            <input type="date" [(ngModel)]="endDate" class="mt-1 block w-full border rounded p-2" />
          </div>
          <div class="flex items-end">
            <button (click)="generateReport()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
              Generate Report
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="loading()" class="text-blue-500">Generating report...</div>
      <div *ngIf="error()" class="text-red-500">{{ error() }}</div>

      <div *ngIf="reportData()" class="bg-white p-6 rounded shadow">
        <h2 class="text-xl font-semibold mb-4">{{ reportType }} as of {{ endDate }}</h2>
        <pre class="bg-gray-100 p-4 rounded">{{ reportData() | json }}</pre>
      </div>
    </div>
  `,
})
export class FinancialReportsComponent {
  private accounting = useAccounting();
  reportType = 'BALANCE_SHEET';
  endDate = new Date().toISOString().split('T')[0];

  loading = selectIsReportsLoading;
  error = selectReportsError;
  reportData = () => reportsState().data;

  generateReport() {
    this.accounting.generateReport(this.reportType, this.endDate);
  }
}
