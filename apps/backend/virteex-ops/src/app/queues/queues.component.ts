import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'virteex-queues',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <h2>Queues Module</h2>
      <p>This is the placeholder for the queues module.</p>
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
export class QueuesComponent {}
