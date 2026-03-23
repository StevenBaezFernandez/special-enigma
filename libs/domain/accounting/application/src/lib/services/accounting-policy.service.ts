import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountingPolicyService {
  // TODO: Implement tenant-specific policies from database/config
  private readonly defaultPolicies: Record<string, any> = {
    invoice: {
      salesAccountCode: '401.01',
      vatAccountCode: '208.01',
      clientAccountCode: '105.01',
    },
    payroll: {
      salaryExpenseAccountCode: '601.01',
      taxPayableAccountCode: '210.01',
      bankAccountCode: '102.01',
    },
  };

  resolveAccountsForInvoice(tenantId: string) {
    // For now, we return default policies, but we already have the tenantId to specialize later
    return this.getPolicyForTenant(tenantId, 'invoice');
  }

  resolveAccountsForPayroll(tenantId: string) {
    return this.getPolicyForTenant(tenantId, 'payroll');
  }

  private getPolicyForTenant(tenantId: string, type: 'invoice' | 'payroll') {
    // Future logic: this.policyRepository.findByTenant(tenantId)
    return this.defaultPolicies[type];
  }
}
