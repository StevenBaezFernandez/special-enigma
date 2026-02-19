import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'virteex-mobile-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.page.html',
  styles: [`
    .dashboard-container { padding: 20px; }
    .card { background: #fff; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-value { font-size: 24px; font-weight: bold; color: #333; }
    .stat-label { font-size: 14px; color: #666; }
    .menu-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
    .menu-item { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px; text-decoration: none; font-weight: bold; }
    .error-banner { background: #fee; color: #c00; padding: 10px; border-radius: 4px; margin-bottom: 15px; border: 1px solid #fcc; }
  `]
})
export class DashboardPage {
  private dashboardService = inject(DashboardService);
  errorMessage = '';

  stats$ = this.dashboardService.getStats().pipe(
    catchError(err => {
      this.errorMessage = 'Failed to load dashboard statistics. Please try again later.';
      console.error('Dashboard Error:', err);
      return of(null);
    })
  );
}
