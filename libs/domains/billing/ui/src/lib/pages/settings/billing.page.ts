import { Component, ChangeDetectionStrategy, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CreditCard, Download, CheckCircle, Info } from 'lucide-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { BillingService } from '../../core/services/billing';

@Component({
  selector: 'virteex-billing-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './billing.page.html',
  styleUrls: ['./billing.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingPage implements OnInit {
  private billingService = inject(BillingService);

  // Íconos
  protected readonly CreditCardIcon = CreditCard;
  protected readonly DownloadIcon = Download;
  protected readonly CheckCircleIcon = CheckCircle;
  protected readonly InfoIcon = Info;

  // Convertimos los datos del servicio en señales
  subscription = toSignal(this.billingService.getSubscription());
  paymentMethod = toSignal(this.billingService.getPaymentMethod());
  paymentHistory = toSignal(this.billingService.getPaymentHistory());
  availablePlans = toSignal(this.billingService.getPlans(), { initialValue: [] });

  // Retrieved from Subscription response or Auth Service
  customerId = signal<string | null>(null);

  // Estado para la UI
  selectedPlan = signal<string>('pro');
  isProcessing = signal(false);

  constructor() {
    effect(() => {
      const sub = this.subscription();
      if (sub && sub.stripeCustomerId) {
          this.customerId.set(sub.stripeCustomerId);
      }
    });
  }

  ngOnInit(): void {
    const currentPlanId = this.subscription()?.planId;
    if (currentPlanId) {
      this.selectedPlan.set(currentPlanId);
    }
  }

  selectPlan(planId: string): void {
    this.selectedPlan.set(planId);
  }

  upgradePlan(priceId: string): void {
    const custId = this.customerId();
    if (!custId) {
        console.error('No customer ID found');
        return;
    }
    this.isProcessing.set(true);
    this.billingService.createCheckoutSession(priceId, custId).subscribe({
      next: (response) => {
        window.location.href = response.url;
      },
      error: (err) => {
        console.error('Checkout error', err);
        this.isProcessing.set(false);
      }
    });
  }

  manageSubscription(): void {
    const custId = this.customerId();
    if (!custId) {
        console.error('No customer ID found');
        return;
    }
    this.isProcessing.set(true);
    this.billingService.createPortalSession(custId).subscribe({
      next: (response) => {
        window.location.href = response.url;
      },
      error: (err) => {
        console.error('Portal error', err);
        this.isProcessing.set(false);
      }
    });
  }
}
