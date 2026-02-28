import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
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

      <div class="form-container">
        <form [formGroup]="tenantForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Company Name</label>
            <input id="name" type="text" formControlName="name" class="form-control" />
            <div *ngIf="tenantForm.get('name')?.invalid && (tenantForm.get('name')?.dirty || tenantForm.get('name')?.touched)" class="text-danger">
              Name is required.
            </div>
          </div>

          <div class="form-group">
            <label for="taxId">Tax ID (RFC/NIT)</label>
            <input id="taxId" type="text" formControlName="taxId" class="form-control" />
            <div *ngIf="tenantForm.get('taxId')?.invalid && (tenantForm.get('taxId')?.dirty || tenantForm.get('taxId')?.touched)" class="text-danger">
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
            <div *ngIf="tenantForm.get('email')?.invalid && (tenantForm.get('email')?.dirty || tenantForm.get('email')?.touched)" class="text-danger">
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

          <div *ngIf="errorMsg" class="alert alert-danger">
            {{ errorMsg }}
          </div>

          <div class="actions">
            <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancel</button>
            <button type="submit" class="btn btn-primary" [disabled]="tenantForm.invalid || loading">
              {{ loading ? 'Creating...' : 'Create Tenant' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 40px; max-width: 800px; margin: 0 auto; font-family: sans-serif; }
    .page-header h2 { margin-top: 0; color: #2d3748; }
    .form-container { background: white; padding: 32px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #4a5568; font-size: 0.95rem; }
    .form-control { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 1rem; box-sizing: border-box; transition: border-color 0.2s; }
    .form-control:focus { outline: none; border-color: #4299e1; box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2); }
    .actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 32px; padding-top: 20px; border-top: 1px solid #edf2f7; }
    .btn { padding: 10px 24px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; font-size: 0.95rem; transition: background-color 0.2s; }
    .btn-primary { background-color: #3182ce; color: white; }
    .btn-primary:hover:not(:disabled) { background-color: #2b6cb0; }
    .btn-primary:disabled { background-color: #bee3f8; cursor: not-allowed; }
    .btn-secondary { background-color: #edf2f7; color: #4a5568; }
    .btn-secondary:hover { background-color: #e2e8f0; }
    .text-danger { color: #e53e3e; font-size: 0.875rem; margin-top: 6px; }
    .alert-danger { background-color: #fff5f5; border: 1px solid #feb2b2; color: #c53030; padding: 12px; border-radius: 6px; margin-bottom: 20px; }
  `]
})
export class CreateTenantComponent {
  private fb = inject(FormBuilder);
  private tenantService = inject(TenantService);
  private router = inject(Router);

  tenantForm: FormGroup = this.fb.group({
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
          this.errorMsg = err.error?.message || 'Failed to create tenant. Please try again.';
          console.error('Create tenant error:', err);
        }
      });
    } else {
      this.tenantForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/tenants']);
  }
}
