import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = '/api/subscription/plans';
  private http = inject(HttpClient);

  getPlans(): Observable<Plan[]> {
    return this.http.get<Plan[]>(this.apiUrl);
  }
}
