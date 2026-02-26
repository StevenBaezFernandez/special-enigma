import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TenantService } from './tenant.service';

@Component({
  selector: 'virteex-create-tenant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>Create New Tenant</h2>
      </div>

      <form [formGroup]="tenantForm" (ngSubmit)="onSubmit()" class="form-container">
        <div class="form-group">
          <label for="name">Company Name</label>
          <input id="name" type="text" formControlName="name" class="form-control" />
          <div *ngIf="tenantForm.get('name')?.invalid && tenantForm.get('name')?.touched" class="text-danger">
            Name is required.
          </div>
        </div>

        <div class="form-group">
          <label for="taxId">Tax ID (RFC/NIT)</label>
          <input id="taxId" type="text" formControlName="taxId" class="form-control" />
          <div *ngIf="tenantForm.get('taxId')?.invalid && tenantForm.get('taxId')?.touched" class="text-danger">
            Tax ID is required.
          </div>
        </div>

        <div class="form-group">
          <label for="country">Country</label>
          <select id="country" formControlName="country" class="form-control">
            <option value="CO">Colombia</option>
            <option value="MX">Mexico</option>
            <option value="US">USA</option>
          </select>
        </div>

        <div class="form-group">
          <label for="email">Admin Email</label>
          <input id="email" type="email" formControlName="email" class="form-control" />
           <div *ngIf="tenantForm.get('email')?.invalid && tenantForm.get('email')?.touched" class="text-danger">
            Valid email is required.
          </div>
        </div>

         <div class="form-group">
          <label for="plan">Plan</label>
          <select id="plan" formControlName="plan" class="form-control">
            <option value="TRIAL">Trial</option>
            <option value="PROFESSIONAL">Professional</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </div>

        <div class="actions">
          <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="tenantForm.invalid || loading">
            {{ loading ? 'Creating...' : 'Create Tenant' }}
          </button>
        </div>

        <div *ngIf="errorMsg" class="alert alert-danger mt-3">{{ errorMsg }}</div>
      </form>
    </div>
  `,
  styles: [`
    .page-container { padding: 20px; max-width: 600px; margin: 0 auto; }
    .page-header { margin-bottom: 24px; }
    .form-container { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-weight: 500; color: #4a5568; }
    .form-control { width: 100%; padding: 8px 12px; border: 1px solid #cbd5e0; border-radius: 4px; }
    .actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn { padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer; font-weight: 500; }
    .btn-primary { background-color: #4299e1; color: white; }
    .btn-secondary { background-color: #e2e8f0; color: #4a5568; }
    .text-danger { color: #e53e3e; font-size: 0.875rem; margin-top: 4px; }
    .alert-danger { color: #721c24; background-color: #f8d7da; border-color: #f5c6cb; padding: 10px; border-radius: 4px; }
  `]
})
export class CreateTenantComponent {
  private fb = inject(FormBuilder);
  private tenantService = inject(TenantService);
  private router = inject(Router);

  tenantForm = this.fb.group({
    name: ['', Validators.required],
    taxId: ['', Validators.required],
    country: ['CO', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    plan: ['TRIAL', Validators.required]
  });

  loading = false;
  errorMsg = '';

  onSubmit() {
    if (this.tenantForm.valid) {
      this.loading = true;
      this.errorMsg = '';
      this.tenantService.createTenant(this.tenantForm.value).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/tenants']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err.error?.message || 'Failed to create tenant.';
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/tenants']);
  }
}
