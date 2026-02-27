import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TenantsFacade } from './tenants.facade';
import { TenantsTableComponent } from './components/tenants-table.component';

@Component({
  selector: 'virteex-tenants-page-container',
  standalone: true,
  imports: [CommonModule, TenantsTableComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>Tenant Management</h2>
        <button class="btn btn-primary" (click)="onNewTenant()">New Tenant</button>
      </div>

      <virteex-tenants-table [tenants]="tenants() ?? []" />
    </div>
  `,
  styles: ['.page-container { padding: 20px; } .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }']
})
export class TenantsComponent {
  private readonly router = inject(Router);
  private readonly tenantsFacade = inject(TenantsFacade);

  readonly tenants = toSignal(this.tenantsFacade.getTenants(), { initialValue: [] });

  onNewTenant(): void {
    this.router.navigate(['/tenants/create']);
  }
}
