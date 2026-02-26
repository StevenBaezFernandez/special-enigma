import { APP_CONFIG } from '@virteex/shared-config';
// app/core/api/customers.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Customer } from '../models/customer.model';

export type CreateCustomerDto = Omit<Customer, 'id' | 'organizationId' | 'createdAt' | 'updatedAt' | 'totalBilled'>;
export type UpdateCustomerDto = Partial<CreateCustomerDto>;

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private config = inject(APP_CONFIG);
  private http = inject(HttpClient);
  private apiUrl = `${this.config.apiUrl}/customers`;

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl);
  }

  getCustomerById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  createCustomer(customer: CreateCustomerDto): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer);
  }

  updateCustomer(id: string, customer: UpdateCustomerDto): Observable<Customer> {
    return this.http.patch<Customer>(`${this.apiUrl}/${id}`, customer);
  }

  deleteCustomer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}