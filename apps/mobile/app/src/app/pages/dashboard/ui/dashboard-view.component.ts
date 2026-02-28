import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'virteex-dashboard-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-view.component.html',
  styleUrl: './dashboard-view.component.scss',
})
export class DashboardViewComponent {
  @Input() stats: any = null;
  @Input() errorMessage = '';
}
