import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingService } from './billing.service';

@Component({
  selector: 'virteex-billing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="billing-container">
      <h2>Subscription Plans</h2>
      <div class="plans-grid">
        @for (plan of plans$ | async; track plan.id) {
          <div class="plan-card">
            <h3>{{ plan.name }}</h3>
            <div class="price">
              <span class="currency">{{ plan.currency }}</span>
              <span class="amount">{{ plan.price }}</span>
              <span class="period">/mo</span>
            </div>
            <ul class="features">
              @for (feature of plan.features; track feature) {
                <li>{{ feature }}</li>
              }
            </ul>
            <button class="btn btn-edit">Edit Plan</button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .billing-container { padding: 20px; }
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    .plan-card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      text-align: center;
    }
    .price {
      font-size: 2rem;
      font-weight: bold;
      margin: 16px 0;
    }
    .features {
      list-style: none;
      padding: 0;
      margin-bottom: 24px;
      text-align: left;
    }
    .features li {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .btn-edit {
      width: 100%;
      padding: 10px;
      background-color: #4299e1;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class BillingComponent {
  billingService = inject(BillingService);
  plans$ = this.billingService.getPlans();
}
