import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, TrendingUp, TrendingDown } from 'lucide-angular';
import { Kpi } from '../../../core/models/finance';

@Component({
  selector: 'virteex-kpi-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './kpi-card.html',
  styleUrls: ['./kpi-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCard {
  @Input() data: Kpi | undefined;

  isStale(): boolean {
    if (!this.data?.lastUpdated) return false;
    const lastUpdate = new Date(this.data.lastUpdated).getTime();
    const now = new Date().getTime();
    return (now - lastUpdate) > 24 * 60 * 60 * 1000; // 24 hours
  }

  protected readonly TrendingUpIcon = TrendingUp;
  protected readonly TrendingDownIcon = TrendingDown;
}