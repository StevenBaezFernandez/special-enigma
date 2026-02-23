import { Component, ChangeDetectionStrategy, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CreditCard, Download, CheckCircle, Info } from 'lucide-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { BillingService } from '../../core/services/billing';
import { NotificationService } from '../../core/services/notification';

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
  private notificationService = inject(NotificationService);

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
  usageMetrics = toSignal(this.billingService.getUsage(), { initialValue: [] });

  // Retrieved from Subscription response or Auth Service
  customerId = signal<string | null>(null);

  // Estado para la UI
  selectedPlan = signal<string>('pro');
  isProcessing = signal(false);
  isSaving = signal(false);

  constructor() {
    effect(() => {
      const sub = this.subscription();
      if (sub && sub.externalCustomerId) {
          this.customerId.set(sub.externalCustomerId);
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
        this.notificationService.error('No se encontró ID de cliente. Contacte a soporte.');
        return;
    }
    this.isProcessing.set(true);
    this.isSaving.set(true);
    this.billingService.createCheckoutSession(priceId, custId).subscribe({
      next: (response) => {
        window.location.href = response.url;
      },
      error: (err) => {
        console.error('Checkout error', err);
        this.notificationService.error('Error al iniciar el checkout.');
        this.isProcessing.set(false);
        this.isSaving.set(false);
      }
    });
  }

  updatePlan() {
    const planSlug = this.selectedPlan();
    if (!planSlug) return;

    const plan = this.availablePlans().find(p => p.slug === planSlug);

    if (plan && plan.stripePriceId) {
        this.upgradePlan(plan.stripePriceId);
    } else {
        this.notificationService.error('Este plan no tiene un precio configurado.');
    }
  }

  manageSubscription(): void {
    const custId = this.customerId();
    if (!custId) {
        this.notificationService.error('No hay suscripción activa para gestionar.');
        return;
    }
    this.isProcessing.set(true);
    this.billingService.createPortalSession(custId).subscribe({
      next: (response) => {
        window.location.href = response.url;
      },
      error: (err) => {
        console.error('Portal error', err);
        this.notificationService.error('Error al abrir el portal de facturación.');
        this.isProcessing.set(false);
      }
    });
  }
}
