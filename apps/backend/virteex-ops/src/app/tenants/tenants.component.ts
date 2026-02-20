import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TenantService, Company } from './tenant.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'virteex-tenants',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>Tenant Management</h2>
        <button class="btn btn-primary" (click)="onNewTenant()">New Tenant</button>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Tax ID</th>
              <th>Country</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (tenant of tenants$ | async; track tenant.id) {
              <tr>
                <td>{{ tenant.id | slice:0:8 }}...</td>
                <td>{{ tenant.name }}</td>
                <td>{{ tenant.taxId }}</td>
                <td>{{ tenant.country }}</td>
                <td>
                  <span class="status-badge" [class.active]="tenant.status !== 'SUSPENDED'">
                    {{ tenant.status || 'ACTIVE' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline">View</button>
                  <button class="btn btn-sm btn-danger">Suspend</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="text-center">No tenants found.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 20px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow-x: auto;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th, .data-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    .data-table th {
      background-color: #f7fafc;
      font-weight: 600;
      color: #4a5568;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .btn-primary {
      background-color: #4299e1;
      color: white;
    }
    .btn-sm {
      padding: 4px 8px;
      font-size: 0.75rem;
      margin-right: 4px;
    }
    .btn-outline {
      border: 1px solid #cbd5e0;
      background: white;
    }
    .btn-danger {
      background-color: #e53e3e;
      color: white;
    }
    .status-badge {
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 0.75rem;
      background-color: #cbd5e0;
      color: #4a5568;
    }
    .status-badge.active {
      background-color: #c6f6d5;
      color: #2f855a;
    }
    .text-center { text-align: center; }
  `]
})
export class TenantsComponent {
  tenantService = inject(TenantService);
  tenants$: Observable<Company[]> = this.tenantService.getTenants();

  onNewTenant() {
    // Navigate to create form
    // TODO: Implement navigation
  }
}
