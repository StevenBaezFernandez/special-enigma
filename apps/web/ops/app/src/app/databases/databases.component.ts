import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'virteex-databases',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <h2>Databases Module</h2>
      <p>Operational panel for databases. Connect data sources and enable module-specific actions from this console.</p>
    </div>
  `,
  styles: [`
    .module-container {
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
})
export class DatabasesComponent {}
