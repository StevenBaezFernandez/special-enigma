import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CrmService } from '../../core/services/crm.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'virteex-mobile-crm',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="header">
        <a routerLink="/dashboard">&lt; Back</a>
        <h1>My Deals</h1>
      </div>

      <div *ngIf="errorMessage" class="error-banner">{{ errorMessage }}</div>

      <div class="deal-list" *ngIf="deals$ | async as deals; else loading">
        <div class="card" *ngFor="let deal of deals">
          <div class="title">{{ deal.name }}</div>
          <div class="meta">{{ deal.company }} - {{ deal.stage }}</div>
          <div class="value">{{ deal.amount | currency }}</div>
        </div>
        <div *ngIf="deals.length === 0">No active deals.</div>
      </div>
      <ng-template #loading>
        <div *ngIf="!errorMessage">Loading deals...</div>
      </ng-template>

      <div class="fab">
        <button>+</button>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 15px; }
    .header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
    .card { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-bottom: 10px; position: relative; }
    .title { font-weight: bold; font-size: 16px; }
    .meta { color: #666; font-size: 14px; }
    .value { font-size: 18px; font-weight: bold; color: #007bff; position: absolute; right: 15px; top: 15px; }
    .fab { position: fixed; bottom: 30px; right: 30px; }
    .fab button { width: 56px; height: 56px; border-radius: 50%; background: #007bff; color: white; border: none; font-size: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .error-banner { background: #fee; color: #c00; padding: 10px; border-radius: 4px; margin-bottom: 15px; border: 1px solid #fcc; }
  `]
})
export class CrmPage {
  private crmService = inject(CrmService);
  errorMessage = '';

  deals$ = this.crmService.getDeals().pipe(
    catchError(err => {
      this.errorMessage = 'Failed to load deals. Please verify your connection.';
      console.error(err);
      return of([]);
    })
  );
}
