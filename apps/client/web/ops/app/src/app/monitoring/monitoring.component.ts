import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitoringService, ServiceHealth } from './monitoring.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'virteex-monitoring',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <div class="header">
        <h2>System Observability</h2>
        <div class="header-actions">
           <button class="btn-refresh" (click)="refresh()">Refresh Now</button>
           <span class="refresh-indicator">Last update: {{ lastUpdate | date:'mediumTime' }}</span>
        </div>
      </div>

      <div class="health-grid" *ngIf="health$ | async as services; else loading">
        <div class="service-card" *ngFor="let service of services" [attr.data-status]="service.status">
          <div class="service-header">
            <span class="status-dot"></span>
            <span class="service-name">{{ service.name }}</span>
            <span class="version">{{ service.version }}</span>
          </div>
          <div class="service-metrics">
            <div class="metric">
              <span class="label">Latency</span>
              <span class="value">{{ service.latency }}ms</span>
            </div>
            <div class="metric">
              <span class="label">Status</span>
              <span class="value">{{ service.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <ng-template #loading>
        <div class="loading-state">
           <div class="spinner"></div>
           <p>Scanning system nodes and health endpoints...</p>
        </div>
      </ng-template>

      <div class="alerts-section" *ngIf="health$ | async as services">
         <h3>Active Infrastructure Alerts</h3>
         <div class="alert-item" *ngFor="let s of services" [class.high]="s.status === 'UNKNOWN' || s.status === 'DEGRADED'" [hidden]="s.status === 'UP'">
            <div class="alert-icon">⚠️</div>
            <div class="alert-body">
               <strong>{{ s.name }} Status Alert</strong>
               <p>The service is currently reporting a status of {{ s.status }}. Immediate investigation recommended.</p>
            </div>
         </div>
         <div class="empty-alerts" *ngIf="!hasAlerts(services)">
            <p>✅ All core systems are operating within normal parameters.</p>
         </div>
      </div>
    </div>
  `,
  styles: [`
    .module-container { padding: 32px; background: #f8fafc; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .header h2 { margin: 0; color: #1a202c; }
    .refresh-indicator { font-size: 0.8rem; color: #718096; }

    .health-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
    .service-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .service-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; background: #cbd5e0; }
    .service-card[data-status="UP"] .status-dot { background: #48bb78; }
    .service-card[data-status="DOWN"] .status-dot { background: #f56565; }
    .service-card[data-status="DEGRADED"] .status-dot { background: #ecc94b; }

    .service-name { font-weight: 700; color: #2d3748; flex: 1; }
    .version { font-size: 0.75rem; color: #a0aec0; background: #f7fafc; padding: 2px 6px; border-radius: 4px; }

    .service-metrics { display: flex; justify-content: space-between; }
    .metric { display: flex; flex-direction: column; }
    .label { font-size: 0.75rem; color: #718096; text-transform: uppercase; }
    .value { font-weight: 600; color: #2d3748; }

    .loading-state { padding: 100px; text-align: center; color: #718096; }

    .alerts-section { margin-top: 48px; }
    .alert-item { display: flex; gap: 16px; padding: 16px; border-radius: 8px; border-left: 4px solid #cbd5e0; background: white; margin-bottom: 12px; }
    .alert-item.high { border-left-color: #f56565; background: #fff5f5; }
    .alert-body strong { display: block; margin-bottom: 4px; color: #c53030; }
    .alert-body p { margin: 0; font-size: 0.9rem; color: #742a2a; }
  `]
})
export class MonitoringComponent implements OnInit {
  private monitoringService = inject(MonitoringService);
  health$!: Observable<ServiceHealth[]>;
  lastUpdate = new Date();

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.health$ = this.monitoringService.getSystemHealth();
    this.lastUpdate = new Date();
  }

  hasAlerts(services: ServiceHealth[]): boolean {
    return services.some(s => s.status !== 'UP');
  }
}
