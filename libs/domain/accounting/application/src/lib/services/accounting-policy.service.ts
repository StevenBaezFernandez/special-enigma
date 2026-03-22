import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountingPolicyService {
  resolveAccountsForInvoice(tenantId: string) {
    return {
      salesAccountCode: '401.01',
      vatAccountCode: '208.01',
      clientAccountCode: '105.01',
    };
  }

  resolveAccountsForPayroll(tenantId: string) {
    return {
      salaryExpenseAccountCode: '601.01',
      taxPayableAccountCode: '210.01',
      bankAccountCode: '102.01',
    };
  }
}
