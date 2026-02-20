import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private apiUrl = 'http://localhost:3000/api/billing/plans'; // Assuming existing endpoint
  private http = inject(HttpClient);

  getPlans(): Observable<Plan[]> {
    // Mock for now if endpoint is not verified
    return of([
      { id: '1', name: 'Starter', price: 29, currency: 'USD', features: ['5 Users', 'Basic Support'] },
      { id: '2', name: 'Professional', price: 99, currency: 'USD', features: ['20 Users', 'Priority Support'] },
      { id: '3', name: 'Enterprise', price: 299, currency: 'USD', features: ['Unlimited Users', 'Dedicated Support'] }
    ]);
  }
}
