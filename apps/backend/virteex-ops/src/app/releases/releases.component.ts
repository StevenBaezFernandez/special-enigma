import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'virteex-releases',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <h2>Releases Module</h2>
      <p>This is the placeholder for the releases module.</p>
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
export class ReleasesComponent {}
