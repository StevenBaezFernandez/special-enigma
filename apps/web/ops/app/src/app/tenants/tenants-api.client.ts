import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/config/api-base-url.token';

export interface TenantDto {
  id: string;
  name: string;
  taxId: string;
  country: string;
  createdAt?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class TenantsApiClient {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getTenants(): Observable<TenantDto[]> {
    return this.http.get<TenantDto[]>(`${this.apiBaseUrl}/admin/tenants`);
  }

  getTenant(id: string): Observable<TenantDto> {
    return this.http.get<TenantDto>(`${this.apiBaseUrl}/admin/tenants/${id}`);
  }

  createTenant(data: Record<string, unknown>): Observable<TenantDto> {
    return this.http.post<TenantDto>(`${this.apiBaseUrl}/admin/tenants`, data);
  }
}
