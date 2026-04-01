import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '@virteex/shared-config';

@Component({
  selector: 'virteex-feature-flags',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <h2>Tenant Feature Flags</h2>
      <p>Active feature flags for your current tenant:</p>
      <div class="flags-grid" *ngIf="flags(); else loading">
        <div *ngFor="let flag of flags() | keyvalue" class="flag-card">
          <span class="flag-name">{{ flag.key }}</span>
          <span class="flag-status" [class.enabled]="flag.value" [class.disabled]="!flag.value">
            {{ flag.value ? 'Enabled' : 'Disabled' }}
          </span>
        </div>
      </div>
      <ng-template #loading>
        <p>Loading feature flags...</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .module-container {
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .flags-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }
    .flag-card {
      padding: 15px;
      border: 1px solid #eee;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .flag-name {
      font-weight: 500;
      text-transform: capitalize;
    }
    .flag-status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
    }
    .enabled { background: #e6f4ea; color: #1e7e34; }
    .disabled { background: #fdf2f2; color: #c81e1e; }
  `]
})
export class FeatureFlagsComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  flags = signal<Record<string, boolean> | null>(null);

  ngOnInit() {
    this.http.get<Record<string, boolean>>(`${this.apiUrl}/tenant/feature-flags`)
      .subscribe(res => this.flags.set(res));
  }
}
