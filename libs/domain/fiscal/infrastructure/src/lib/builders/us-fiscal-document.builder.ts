import { Injectable } from '@nestjs/common';
import { FiscalDocumentBuilder, TenantFiscalConfig } from '@virteex/domain-fiscal-domain';
import { InvoiceContract, CustomerBillingInfoContract } from '@virteex/domain-billing-contracts';

@Injectable()
export class UsFiscalDocumentBuilder implements FiscalDocumentBuilder {
  async build(invoice: InvoiceContract, tenantConfig: TenantFiscalConfig, customer: CustomerBillingInfoContract): Promise<string> {
      // US doesn't require XML stamping usually. Just a JSON representation or PDF data.
      // For this abstraction, we'll return a JSON string that can be used by a PDF generator or API.

      const doc = {
          invoiceNumber: invoice.id,
          date: invoice.issueDate,
          dueDate: (invoice as any).dueDate,
          seller: {
              name: tenantConfig.legalName,
              address: tenantConfig.fiscalAddress || 'N/A',
              taxId: tenantConfig.rfc // Using RFC field for EIN mapping
          },
          buyer: {
              name: customer.legalName,
              address: (customer as any).address || 'N/A',
              taxId: customer.taxId
          },
          items: ((invoice as any).items || []).map((item: any) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount
          })),
          subTotal: invoice.subTotal || 0,
          tax: invoice.taxAmount,
          total: invoice.totalAmount,
          notes: (invoice as any).notes || ''
      };

      return JSON.stringify(doc);
  }
}
