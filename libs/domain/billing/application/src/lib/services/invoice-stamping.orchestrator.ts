import { Injectable } from '@nestjs/common';
import { FiscalStampingService, Invoice } from '@virteex/domain-billing-domain';

@Injectable()
export class InvoiceStampingOrchestrator {
  constructor(private readonly fiscalStampingService: FiscalStampingService) {}

  async stamp(invoice: Invoice): Promise<void> {
    const stamp = await this.fiscalStampingService.stampInvoice(invoice);

    invoice.markStamped({
      uuid: stamp.uuid,
      xml: stamp.xml,
      stampedAt: new Date(stamp.fechaTimbrado)
    });
  }
}
