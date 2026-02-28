import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TenantsApiClient, TenantDto } from './tenants-api.client';

export interface TenantSummary {
  id: string;
  name: string;
  taxId: string;
  country: string;
  createdAt?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private readonly apiClient = inject(TenantsApiClient);

  getTenants(): Observable<TenantSummary[]> {
    return this.apiClient.getTenants();
  }

  getTenant(id: string): Observable<TenantSummary> {
    return this.apiClient.getTenant(id);
  }

  createTenant(data: Record<string, unknown>): Observable<TenantSummary> {
    return this.apiClient.createTenant(data);
  }

  fromTenantDto(dto: TenantDto): TenantSummary {
    return {
      id: dto.id,
      name: dto.name,
      taxId: dto.taxId,
      country: dto.country,
      createdAt: dto.createdAt,
      status: dto.status,
    };
  }
}
