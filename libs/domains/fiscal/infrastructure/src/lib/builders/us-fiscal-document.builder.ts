import { Injectable } from '@nestjs/common';
import { Invoice, CustomerBillingInfo } from '@virteex/domain-billing-domain';
import { FiscalDocumentBuilder, TenantFiscalConfig } from '@virteex/domain-fiscal-domain';

@Injectable()
export class UsFiscalDocumentBuilder implements FiscalDocumentBuilder {
  async build(invoice: Invoice, tenantConfig: TenantFiscalConfig, customer: CustomerBillingInfo): Promise<string> {
      // US doesn't require XML stamping usually. Just a JSON representation or PDF data.
      // For this abstraction, we'll return a JSON string that can be used by a PDF generator or API.

      const doc = {
          invoiceNumber: invoice.id,
          date: invoice.issueDate,
          dueDate: invoice.dueDate,
          seller: {
              name: tenantConfig.legalName,
              address: tenantConfig.fiscalAddress || 'N/A',
              taxId: tenantConfig.rfc // Using RFC field for EIN mapping
          },
          buyer: {
              name: customer.legalName,
              address: customer.address || 'N/A',
              taxId: customer.rfc // Using RFC field for TaxID mapping
          },
          items: invoice.items.getItems().map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount
          })),
          subTotal: invoice.subTotal || 0, // Assuming property exists or calculation needed
          tax: invoice.taxAmount,
          total: invoice.totalAmount,
          notes: invoice.notes || ''
      };

      return JSON.stringify(doc);
  }
}
