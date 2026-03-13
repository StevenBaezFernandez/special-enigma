import { Injectable } from '@nestjs/common';

@Injectable()
export class FiscalDomainService {
  async verifyInvoiceLegalStatus(invoiceId: string, tenantId: string): Promise<string> {
    return 'VALID'; // Stub
  }
}
