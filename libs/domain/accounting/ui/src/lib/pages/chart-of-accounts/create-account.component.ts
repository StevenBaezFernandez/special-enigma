import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AccountingService } from '../../services/accounting.service';
import { AccountType } from '@virteex/domain-accounting-contracts';
import { AccountDto } from '@virteex/domain-accounting-contracts';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="flex items-center mb-6">
        <a routerLink="/accounting/accounts" class="text-blue-600 hover:text-blue-800 mr-4">
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
                <option *ngFor="let acc of accounts" [value]="acc.id">{{ acc.code }} - {{ acc.name }}</option>
              </select>
            </div>

            <div class="flex justify-end mt-4">
              <button type="button" routerLink="/accounting/accounts" class="mr-4 px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">
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
  private fb = inject(FormBuilder);
  private accountingService = inject(AccountingService);
  private router = inject(Router);

  accountForm = this.fb.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    type: [AccountType.ASSET, Validators.required],
    parentId: [null as string | null]
  });

  accountTypes = Object.values(AccountType);
  accounts: AccountDto[] = [];
  loading = false;
  error = '';

  get f() { return this.accountForm.controls; }

  ngOnInit() {
    this.accountingService.getAccounts().subscribe(data => {
      this.accounts = data;
    });
  }

  onSubmit() {
    if (this.accountForm.invalid) return;

    this.loading = true;
    this.error = '';

    const dto = {
        code: this.accountForm.value.code!,
        name: this.accountForm.value.name!,
        type: this.accountForm.value.type!,
        parentId: this.accountForm.value.parentId || undefined
    };

    this.accountingService.createAccount(dto).subscribe({
      next: () => {
        this.router.navigate(['/accounting/accounts']);
      },
      error: (err) => {
        this.error = 'Failed to create account. ' + (err.error?.message || '');
        this.loading = false;
      }
    });
  }
}
