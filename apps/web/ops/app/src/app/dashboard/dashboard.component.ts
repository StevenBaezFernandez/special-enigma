import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'virteex-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h2>Operational Overview</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="title">Active Tenants</div>
          <div class="value">42</div>
          <div class="trend up">+12% this month</div>
        </div>
        <div class="stat-card">
          <div class="title">Total Revenue</div>
          <div class="value">$12,450</div>
          <div class="trend up">+8% this month</div>
        </div>
        <div class="stat-card">
          <div class="title">System Health</div>
          <div class="value success">99.98%</div>
          <div class="trend">Uptime</div>
        </div>
        <div class="stat-card">
          <div class="title">Open Tickets</div>
          <div class="value warning">5</div>
          <div class="trend down">-2 since yesterday</div>
        </div>
      </div>

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
export class DashboardComponent {}
