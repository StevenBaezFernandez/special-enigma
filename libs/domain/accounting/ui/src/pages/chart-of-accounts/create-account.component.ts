import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AccountType } from '@virteex/domain-accounting-contracts';
import { createAccountForm } from '../../forms/account.form';
import { useAccounting } from '../../hooks/use-accounting';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="flex items-center mb-6">
        <a routerLink="../" class="text-blue-600 hover:text-blue-800 mr-4">
          &larr; Back to Chart of Accounts
        </a>
        <h1 class="text-2xl font-bold">Create New Account</h1>
      </div>

      <div class="bg-white p-6 rounded shadow max-w-2xl">
        <form [formGroup]="accountForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Account Code</label>
              <input type="text" formControlName="code" class="mt-1 block w-full border rounded p-2" placeholder="e.g. 1100.01" />
              <div *ngIf="f['code'].touched && f['code'].invalid" class="text-red-500 text-xs mt-1">
                Code is required.
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Account Name</label>
              <input type="text" formControlName="name" class="mt-1 block w-full border rounded p-2" placeholder="e.g. Petty Cash" />
              <div *ngIf="f['name'].touched && f['name'].invalid" class="text-red-500 text-xs mt-1">
                Name is required.
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Account Type</label>
              <select formControlName="type" class="mt-1 block w-full border rounded p-2">
                <option *ngFor="let type of accountTypes" [value]="type">{{ type }}</option>
              </select>
              <div *ngIf="f['type'].touched && f['type'].invalid" class="text-red-500 text-xs mt-1">
                Type is required.
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Parent Account (Optional)</label>
              <select formControlName="parentId" class="mt-1 block w-full border rounded p-2">
                <option [value]="null">None</option>
                <option *ngFor="let acc of accounting.accounts()" [value]="acc.id">{{ acc.code }} - {{ acc.name }}</option>
              </select>
            </div>

            <div class="flex justify-end mt-4">
              <button type="button" routerLink="../" class="mr-4 px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" [disabled]="accountForm.invalid || loading" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50">
                {{ loading ? 'Creating...' : 'Create Account' }}
              </button>
            </div>

            <div *ngIf="error" class="text-red-500 text-sm mt-2 text-center">
              {{ error }}
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CreateAccountComponent implements OnInit {
  accounting = useAccounting();
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  accountForm = createAccountForm();

  accountTypes = Object.values(AccountType);
  loading = false;
  error = '';

  get f() { return this.accountForm.controls; }

  ngOnInit() {
    this.accounting.loadAccounts();
  }

  async onSubmit() {
    if (this.accountForm.invalid) return;

    this.loading = true;
    this.error = '';

    const { code, name, type, parentId } = this.accountForm.getRawValue();

    if (!code || !name || !type) {
      this.error = 'Missing required fields';
      this.loading = false;
      return;
    }

    const dto = {
        code,
        name,
        type: type as AccountType,
        parentId: parentId || undefined
    };

    try {
      await this.accounting.createAccount(dto);
      this.router.navigate(['../'], { relativeTo: this.route });
    } catch (err: unknown) {
      const errorResponse = err as { error?: { message?: string }; message?: string };
      this.error = 'Failed to create account. ' + (errorResponse.error?.message || errorResponse.message || '');
      this.loading = false;
    }
  }
}
