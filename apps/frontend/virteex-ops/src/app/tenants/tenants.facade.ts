import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { TenantService, TenantSummary } from './tenant.service';

@Injectable({ providedIn: 'root' })
export class TenantsFacade {
  private readonly tenantService = inject(TenantService);

  getTenants(): Observable<TenantSummary[]> {
    return this.tenantService.getTenants().pipe(map((tenants) => tenants.map((tenant) => this.tenantService.fromTenantDto(tenant))));
  }
}
