import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { catchError, of } from 'rxjs';
import { DashboardViewComponent } from './ui/dashboard-view.component';

@Component({
  selector: 'virteex-mobile-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardViewComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  private readonly dashboardService = inject(DashboardService);
  errorMessage = '';

  readonly stats$ = this.dashboardService.getStats().pipe(
    catchError((err) => {
      this.errorMessage = 'Failed to load dashboard statistics. Please try again later.';
      console.error('Dashboard Error:', err);
      return of(null);
    })
  );
}
