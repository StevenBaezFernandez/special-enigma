import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Plan } from '../models/plan.model';

export interface Subscription {
  planName: string;
  planId: string;
  status: string;
  price: number;
  billingCycle: 'mensual' | 'anual';
  nextBillingDate: string;
  trialEndsDate?: string;
}

export interface PaymentMethod {
  type: string;
  last4: string;
  expiryDate: string;
}

export interface PaymentHistoryItem {
  id: string;
  date: string;
  description: string;
  amount: number;
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1'; // Assuming global prefix

  // Signals for state
  plans = signal<Plan[]>([]);

  // Removed hardcoded mock. Initialized to null.
  currentSubscription = signal<Subscription | null>(null);

  paymentMethod = signal<PaymentMethod | null>(null);

  paymentHistory = signal<PaymentHistoryItem[]>([]);

  constructor() {
    this.loadPlans();
    this.loadSubscription();
  }

  loadPlans() {
    this.http.get<Plan[]>(`${this.apiUrl}/saas/plans`).pipe(
      tap(plans => this.plans.set(plans)),
      catchError(err => {
        console.error('Failed to load plans', err);
        return of([]);
      })
    ).subscribe();
  }

  loadSubscription() {
      this.http.get<Subscription>(`${this.apiUrl}/saas/subscription`).pipe(
          tap(sub => this.currentSubscription.set(sub)),
          catchError(err => {
              // console.error('Failed to load subscription', err);
              // Fallback to null (inactive)
              return of(null);
          })
      ).subscribe();
  }

  getUsage(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/saas/usage`).pipe(
        catchError(err => {
            console.error('Failed to load usage', err);
            return of([]);
        })
    );
  }

  getSubscription(): Observable<Subscription | null> {
    return of(this.currentSubscription());
  }

  getPaymentMethod(): Observable<PaymentMethod | null> {
    return of(this.paymentMethod());
  }

  getPaymentHistory(): Observable<PaymentHistoryItem[]> {
    return of(this.paymentHistory());
  }

  changePlan(newPlanId: string): Observable<boolean> {
    const plan = this.plans().find(p => p.slug === newPlanId || p.id === newPlanId);
    if (!plan) return of(false);

    // We would trigger the checkout flow here
    return this.http.post<{ sessionId: string, url: string }>(`${this.apiUrl}/payment/checkout-session`, {
        priceId: plan.monthlyPriceId, // Defaulting to monthly for now
        successUrl: window.location.href,
        cancelUrl: window.location.href
    }).pipe(
        map(res => {
            if (res.url) {
                window.location.href = res.url;
                return true;
            }
            return false;
        }),
        catchError(err => {
            console.error('Checkout failed', err);
            return of(false);
        })
    );
  }
}
