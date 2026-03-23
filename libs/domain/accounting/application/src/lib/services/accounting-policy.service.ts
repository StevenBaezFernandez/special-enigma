import { Injectable, Inject, Optional } from '@nestjs/common';
import { POLICY_REPOSITORY, type PolicyRepository } from '@virteex/domain-accounting-domain';

@Injectable()
export class AccountingPolicyService {
  constructor(
    @Optional() @Inject(POLICY_REPOSITORY) private readonly policyRepository?: PolicyRepository
  ) {}

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
    closing: {
      retainedEarningsAccountCode: '302.01',
    },
  };

  async resolveAccountsForClosing(tenantId: string) {
    return this.getPolicyForTenant(tenantId, 'closing');
  }

  async resolveAccountsForInvoice(tenantId: string) {
    return this.getPolicyForTenant(tenantId, 'invoice');
  }

  async resolveAccountsForPayroll(tenantId: string) {
    return this.getPolicyForTenant(tenantId, 'payroll');
  }

  private async getPolicyForTenant(tenantId: string, type: 'invoice' | 'payroll' | 'closing') {
    if (this.policyRepository) {
      const tenantPolicy = await this.policyRepository.getPolicy(tenantId, type);
      if (tenantPolicy) {
        return { ...this.defaultPolicies[type], ...tenantPolicy };
      }
    }
    return this.defaultPolicies[type];
  }
}
