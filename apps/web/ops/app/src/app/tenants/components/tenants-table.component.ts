import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantSummary } from '../tenant.service';

@Component({
  selector: 'virteex-tenants-table',
  standalone: true,
  imports: [CommonModule],
  template: `
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
          @for (tenant of tenants; track tenant.id) {
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
            <tr><td colspan="6" class="text-center">No tenants found.</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class TenantsTableComponent {
  @Input({ required: true }) tenants: TenantSummary[] = [];
}
