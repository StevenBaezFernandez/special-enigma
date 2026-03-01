import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, DollarSign, Receipt, Package, Users } from 'lucide-angular';

@Component({
  selector: 'virteex-stat-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './stat-card.html',
  styleUrls: ['./stat-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCard {
  // Recibe un objeto 'data' en lugar de inputs individuales
  @Input() data: any = {};

  // Mapeo de nombres de ícono a objetos de ícono para el binding [img]
  private iconMap: { [key: string]: any } = { DollarSign, Receipt, Package, Users };

  get icon() {
    return this.iconMap[this.data.iconName];
  }

  isPositive(): boolean {
    return this.data.change?.startsWith('+');
  }

  isStale(): boolean {
    if (!this.data?.lastUpdated) return false;
    const lastUpdate = new Date(this.data.lastUpdated).getTime();
    const now = new Date().getTime();
    return (now - lastUpdate) > 24 * 60 * 60 * 1000;
  }
}