import { Injectable, Inject, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@virteex/shared-config';

export interface Subscription {
  id: string;
  planId: string;
  planName?: string;
  status: 'Active' | 'Inactive' | 'Trial';
  price: number;
  billingCycle: string;
  nextBillingDate: string;
  trialEndsDate?: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiryDate: string;
  isDefault?: boolean;
}

export interface CreatePaymentMethodPayload {
  type: string;
  token: string;
  last4?: string;
  expiryDate?: string;
  isDefault?: boolean;
  [key: string]: unknown;
}

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  date: string;
  description: string;
  status: string;
}

export interface SubscriptionPlan {
  id: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  features?: string;
}

export interface UsageItem {
  resource: string;
  used: number;
  limit: number;
  type: string;
  isUnlimited: boolean;
  isEnabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private http = inject(HttpClient);

  constructor(@Inject(API_URL) private apiUrl: string) {}

  getPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(`${this.apiUrl}/billing/plans`);
  }

  getSubscription(tenantId: string = 'default'): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.apiUrl}/billing/subscription?tenantId=${tenantId}`);
  }

  getPaymentMethod(tenantId: string = 'default'): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}/billing/payment-methods?tenantId=${tenantId}`);
  }

  getPaymentHistory(tenantId: string = 'default'): Observable<PaymentHistoryItem[]> {
      return this.http.get<PaymentHistoryItem[]>(`${this.apiUrl}/billing/history?tenantId=${tenantId}`);
  }

  getUsage(tenantId: string = 'default'): Observable<UsageItem[]> {
      return this.http.get<UsageItem[]>(`${this.apiUrl}/billing/usage?tenantId=${tenantId}`);
  }

  changePlan(planId: string, tenantId: string = 'default') {
      return this.http.post(`${this.apiUrl}/billing/subscription`, { planId, tenantId });
  }

  addPaymentMethod(paymentMethod: CreatePaymentMethodPayload, tenantId: string = 'default') {
      return this.http.post(`${this.apiUrl}/billing/payment-methods`, { ...paymentMethod, tenantId });
  }
}
