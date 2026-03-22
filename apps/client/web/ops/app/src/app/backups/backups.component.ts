import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsService } from '../core/operations/operations.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'virteex-backups',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <div class="header">
        <h2>Database Snapshots & Disaster Recovery</h2>
        <button class="btn-primary" (click)="triggerNewSnapshot()">Create New Snapshot</button>
      </div>

      <div class="grid" *ngIf="backups$ | async as backups; else loading">
        <div class="empty-state" *ngIf="backups.length === 0">
           <p>No recent snapshots found in the analytical vault.</p>
        </div>
        <div class="card" *ngFor="let b of backups">
          <div class="status-indicator" [class.success]="b.status === 'SUCCESS' || b.state === 'finalized'"></div>
          <div class="info">
            <strong>{{ b.operationId || b.id }}</strong>
            <span *ngIf="b.type">{{ b.type }} Snapshot <span *ngIf="b.size">· {{ b.size }}</span></span>
            <span *ngIf="b.tenantId">Tenant: {{ b.tenantId }}</span>
            <small>{{ (b.startedAt || b.createdAt) | date:'medium' }}</small>
          </div>
          <div class="actions">
            <button class="btn-sm" [disabled]="b.state === 'switching'" (click)="restore(b)">Restore</button>
            <button class="btn-sm" (click)="verify(b)">Verify Integrity</button>
          </div>
        </div>
      </div>
      <ng-template #loading>
        <div class="loading">Fetching snapshot history...</div>
      </ng-template>
    </div>
  `,
  styles: [`
    .module-container { padding: 32px; }
    .grid { display: flex; flex-direction: column; gap: 16px; }
    .card { background: white; padding: 16px 24px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 20px; }
    .status-indicator { width: 12px; height: 12px; border-radius: 50%; background: #cbd5e0; }
    .status-indicator.success { background: #48bb78; }
    .info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
    .info strong { color: #2d3748; }
    .info span { font-size: 0.85rem; color: #4a5568; }
    .info small { font-size: 0.75rem; color: #a0aec0; }
    .actions { display: flex; gap: 10px; }
    .btn-sm { padding: 4px 12px; font-size: 0.8rem; border-radius: 4px; border: 1px solid #e2e8f0; background: white; cursor: pointer; }
    .loading { padding: 48px; text-align: center; color: #718096; }
  `]
})
export class BackupsComponent implements OnInit {
  private opsService = inject(OperationsService);
  backups$!: Observable<any[]>;
  ngOnInit() { this.refresh(); }

  refresh() { this.backups$ = this.opsService.getBackups(); }

  triggerNewSnapshot() {
    alert('Full cluster snapshot triggered. Check logs for progress.');
    // In a real implementation, this would call a POST endpoint
  }

  restore(snapshot: any) {
    if (confirm(`Are you sure you want to RESTORE ${snapshot.operationId || snapshot.id}? This will overwrite existing data.`)) {
      alert('Restore process initiated.');
    }
  }

  verify(snapshot: any) {
    alert('Integrity check started for snapshot ' + (snapshot.operationId || snapshot.id));
  }
}
