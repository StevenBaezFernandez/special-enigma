import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApprovalsService } from '../../core/services/approvals.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'virteex-mobile-approvals',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="header">
        <a routerLink="/dashboard">&lt; Back</a>
        <h1>Pending Approvals</h1>
      </div>

      <div *ngIf="errorMessage" class="error-banner">{{ errorMessage }}</div>

      <div class="approval-list" *ngIf="approvals$ | async as approvals; else loading">
        <div class="card" *ngFor="let item of approvals">
          <div class="title">{{ item.title }}</div>
          <div class="meta">{{ item.requester }} - {{ item.amount | currency }}</div>
          <div class="actions">
            <button class="btn-approve" (click)="onApprove(item.id)">Approve</button>
            <button class="btn-reject" (click)="onReject(item.id)">Reject</button>
          </div>
        </div>
        <div *ngIf="approvals.length === 0">No pending approvals.</div>
      </div>
      <ng-template #loading>
        <div *ngIf="!errorMessage">Loading...</div>
      </ng-template>
    </div>
  `,
  styles: [`
    .container { padding: 15px; }
    .header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
    .card { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-bottom: 10px; }
    .title { font-weight: bold; font-size: 16px; }
    .meta { color: #666; font-size: 14px; margin-bottom: 10px; }
    .actions { display: flex; gap: 10px; }
    button { flex: 1; padding: 8px; border: none; border-radius: 4px; font-weight: bold; }
    .btn-approve { background: #28a745; color: white; }
    .btn-reject { background: #dc3545; color: white; }
    .error-banner { background: #fee; color: #c00; padding: 10px; border-radius: 4px; margin-bottom: 15px; border: 1px solid #fcc; }
  `]
})
export class ApprovalsPage {
  private approvalsService = inject(ApprovalsService);
  errorMessage = '';

  approvals$ = this.approvalsService.getPendingApprovals().pipe(
    catchError(err => {
      this.errorMessage = 'Failed to load approvals. Please verify your connection.';
      console.error(err);
      return of([]);
    })
  );

  onApprove(id: number) {
    this.errorMessage = '';
    this.approvalsService.approve(id).subscribe({
      next: () => this.refreshList(),
      error: (err) => {
        this.errorMessage = 'Failed to approve request. Try again later.';
        console.error(err);
      }
    });
  }

  onReject(id: number) {
    this.errorMessage = '';
    this.approvalsService.reject(id).subscribe({
      next: () => this.refreshList(),
      error: (err) => {
        this.errorMessage = 'Failed to reject request. Try again later.';
        console.error(err);
      }
    });
  }

  refreshList() {
    this.approvals$ = this.approvalsService.getPendingApprovals().pipe(
      catchError(err => {
        this.errorMessage = 'Failed to reload approvals.';
        console.error(err);
        return of([]);
      })
    );
  }
}
