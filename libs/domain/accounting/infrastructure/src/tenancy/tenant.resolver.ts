export interface TenantResolver {
  resolve(context: any): string;
}

import { AccountingDomainError } from '@virteex/domain-accounting-domain';

export class HeaderTenantResolver implements TenantResolver {
  resolve(request: any): string {
    const tenantId = request.headers['x-tenant-id'];
    if (!tenantId) {
      throw new AccountingDomainError('Missing required x-tenant-id header');
    }
    return tenantId;
  }
}
