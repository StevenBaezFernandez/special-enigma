import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AccountingService } from '../../services/accounting.service';
import { AccountDto } from '@virteex/domain-accounting-contracts';
import { Decimal } from 'decimal.js';

@Component({
  selector: 'app-record-journal-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="flex items-center mb-6">
        <a routerLink="/accounting/journal-entries" class="text-blue-600 hover:text-blue-800 mr-4">
          &larr; Back to Journal Entries
        </a>
        <h1 class="text-2xl font-bold">Record New Journal Entry</h1>
      </div>

      <div class="bg-white p-6 rounded shadow max-w-5xl">
        <form [formGroup]="entryForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" formControlName="date" class="mt-1 block w-full border rounded p-2" />
              <div *ngIf="f['date'].touched && f['date'].invalid" class="text-red-500 text-xs mt-1">
                Date is required.
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <input type="text" formControlName="description" class="mt-1 block w-full border rounded p-2" placeholder="e.g. Monthly rent payment" />
              <div *ngIf="f['description'].touched && f['description'].invalid" class="text-red-500 text-xs mt-1">
                Description is required.
              </div>
            </div>
          </div>

          <div class="mb-4">
            <h2 class="text-lg font-semibold mb-2">Entry Lines</h2>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-32">Debit</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-32">Credit</th>
                    <th class="px-4 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody formArrayName="lines" class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let line of lines.controls; let i=index" [formGroupName]="i">
                    <td class="px-4 py-2">
                      <select formControlName="accountId" class="w-full border rounded p-1 text-sm">
                        <option *ngFor="let acc of accounts" [value]="acc.id">{{ acc.code }} - {{ acc.name }}</option>
                      </select>
                    </td>
                    <td class="px-4 py-2">
                      <input type="text" formControlName="description" class="w-full border rounded p-1 text-sm" />
                    </td>
                    <td class="px-4 py-2">
                      <input type="text" formControlName="debit" (change)="calculateTotals()" class="w-full border rounded p-1 text-sm text-right" placeholder="0.00" />
                    </td>
                    <td class="px-4 py-2">
                      <input type="text" formControlName="credit" (change)="calculateTotals()" class="w-full border rounded p-1 text-sm text-right" placeholder="0.00" />
                    </td>
                    <td class="px-4 py-2 text-center">
                      <button type="button" (click)="removeLine(i)" class="text-red-600 hover:text-red-800" [disabled]="lines.length <= 2">
                        &times;
                      </button>
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-gray-50 font-bold">
                  <tr>
                    <td colspan="2" class="px-4 py-2 text-right">Totals:</td>
                    <td class="px-4 py-2 text-right" [class.text-red-500]="!isBalanced()">{{ totalDebit.toFixed(2) }}</td>
                    <td class="px-4 py-2 text-right" [class.text-red-500]="!isBalanced()">{{ totalCredit.toFixed(2) }}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <button type="button" (click)="addLine()" class="mt-2 text-blue-600 hover:text-blue-800 text-sm font-semibold">
              + Add Line
            </button>
          </div>

          <div *ngIf="!isBalanced() && (totalDebit.gt(0) || totalCredit.gt(0))" class="text-red-500 text-sm mb-4">
            Entry is not balanced. The difference is {{ totalDebit.minus(totalCredit).abs().toFixed(2) }}.
          </div>

          <div class="flex justify-end mt-6">
            <button type="button" routerLink="/accounting/journal-entries" class="mr-4 px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" [disabled]="entryForm.invalid || !isBalanced() || loading" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50">
              {{ loading ? 'Recording...' : 'Record Entry' }}
            </button>
          </div>

          <div *ngIf="error" class="text-red-500 text-sm mt-2 text-center">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  `,
})
export class RecordJournalEntryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private accountingService = inject(AccountingService);
  private router = inject(Router);

  entryForm = this.fb.group({
    date: [new Date().toISOString().split('T')[0], Validators.required],
    description: ['', Validators.required],
    lines: this.fb.array([])
  });

  accounts: AccountDto[] = [];
  loading = false;
  error = '';
  totalDebit = new Decimal(0);
  totalCredit = new Decimal(0);

  get f() { return this.entryForm.controls; }
  get lines() { return this.entryForm.get('lines') as FormArray; }

  ngOnInit() {
    this.accountingService.getAccounts().subscribe(data => {
      this.accounts = data;
    });

    // Add initial 2 lines
    this.addLine();
    this.addLine();
  }

  addLine() {
    const line = this.fb.group({
      accountId: ['', Validators.required],
      description: [''],
      debit: ['0.00', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]],
      credit: ['0.00', [Validators.required, Validators.pattern(/^[0-9]+(\.[0-9]{1,2})?$/)]]
    });
    this.lines.push(line);
  }

  removeLine(index: number) {
    if (this.lines.length > 2) {
      this.lines.removeAt(index);
      this.calculateTotals();
    }
  }

  calculateTotals() {
    this.totalDebit = new Decimal(0);
    this.totalCredit = new Decimal(0);

    this.lines.controls.forEach(control => {
      const debit = new Decimal(control.get('debit')?.value || 0);
      const credit = new Decimal(control.get('credit')?.value || 0);
      this.totalDebit = this.totalDebit.plus(debit);
      this.totalCredit = this.totalCredit.plus(credit);
    });
  }

  isBalanced(): boolean {
    return this.totalDebit.equals(this.totalCredit) && this.totalDebit.gt(0);
  }

  onSubmit() {
    if (this.entryForm.invalid || !this.isBalanced()) return;

    this.loading = true;
    this.error = '';

    const dto = {
        date: new Date(this.entryForm.value.date!),
        description: this.entryForm.value.description!,
        lines: this.entryForm.value.lines!.map((l: any) => ({
            accountId: l.accountId,
            description: l.description || undefined,
            debit: l.debit,
            credit: l.credit
        }))
    };

    this.accountingService.recordJournalEntry(dto).subscribe({
      next: () => {
        this.router.navigate(['/accounting/journal-entries']);
      },
      error: (err) => {
        this.error = 'Failed to record journal entry. ' + (err.error?.message || '');
        this.loading = false;
      }
    });
  }
}
