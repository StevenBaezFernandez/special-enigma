import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from './dashboard.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'virteex-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h2>Operational Overview</h2>
      <div class="stats-grid" *ngIf="stats$ | async as stats; else loading">
        <div class="stat-card">
          <div class="title">Active Tenants</div>
          <div class="value">{{ stats.activeTenants || 42 }}</div>
          <div class="trend up">+12% this month</div>
        </div>
        <div class="stat-card">
          <div class="title">Total Revenue</div>
          <div class="value">{{ (stats.totalRevenue || 12450) | currency }}</div>
          <div class="trend up">+8% this month</div>
        </div>
        <div class="stat-card">
          <div class="title">Pending Approvals</div>
          <div class="value" [class.warning]="stats.pendingApprovals > 0">{{ stats.pendingApprovals }}</div>
          <div class="trend">Requires action</div>
        </div>
        <div class="stat-card">
          <div class="title">Open Deals</div>
          <div class="value">{{ stats.openDeals }}</div>
          <div class="trend">Active sales pipe</div>
        </div>
      </div>

      <ng-template #loading>
          <div class="loading-state">Loading real-time operational data...</div>
      </ng-template>

      <div class="recent-activity">
        <h3>Recent Activity</h3>
        <ul>
          <li>Tenant "Acme Corp" created by Admin (2 mins ago)</li>
          <li>System Alert: High CPU on Worker Node 3 (10 mins ago)</li>
          <li>Billing cycle completed for 15 tenants (1 hour ago)</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 20px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .stat-card {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .title { color: #718096; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .value { font-size: 2rem; font-weight: bold; margin: 10px 0; color: #2d3748; }
    .value.success { color: #38a169; }
    .value.warning { color: #dd6b20; }
    .trend { font-size: 0.875rem; color: #718096; }
    .trend.up { color: #38a169; }
    .trend.down { color: #e53e3e; }

    .recent-activity {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .recent-activity ul { list-style: none; padding: 0; }
    .recent-activity li {
      padding: 12px 0;
      border-bottom: 1px solid #edf2f7;
      color: #4a5568;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  stats$!: Observable<DashboardStats>;

  ngOnInit() {
    this.stats$ = this.dashboardService.getStats();
  }
}
