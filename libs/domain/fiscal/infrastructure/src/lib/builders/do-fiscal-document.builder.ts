import { Injectable, Logger } from '@nestjs/common';
import { XMLBuilder } from 'fast-xml-parser';
import { FiscalDocumentBuilder } from '@virteex/domain-fiscal-domain';
import { TenantFiscalConfig } from '@virteex/domain-fiscal-domain';
import { InvoiceContract, CustomerBillingInfoContract } from '@virteex/domain-billing-contracts';

@Injectable()
export class DoFiscalDocumentBuilder implements FiscalDocumentBuilder {
  private readonly logger = new Logger(DoFiscalDocumentBuilder.name);

  async build(data: any): Promise<string> {
    const { invoice, tenantConfig, customer } = data;
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      suppressEmptyNode: true,
    });

    const items = (invoice as any).items || [];

    // e-CF Types according to DGII:
    // 31: Factura de Crédito Fiscal Electrónica
    // 32: Factura de Consumo Electrónica
    // 33: Nota de Débito Electrónica
    // 34: Nota de Crédito Electrónica
    const tipoeCF = (invoice as any).fiscalType || '31';

    // e-NCF: Letra E + Tipo (2) + Secuencia (10)
    const sequence = (invoice as any).sequence || invoice.id.substring(0, 10).padStart(10, '0');
    const eNCF = `E${tipoeCF}${sequence}`;

    const fechaEmision = new Date().toISOString().split('T')[0];
    const fechaVencimiento = (invoice as any).dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const eCFObj = {
      ECF: {
        '@_xmlns': 'http://dgii.gov.do/sicav/ecf',
        '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '@_xsi:schemaLocation': 'http://dgii.gov.do/sicav/ecf ECf.xsd',
        Encabezado: {
          IdDoc: {
            TipoeCF: tipoeCF,
            eNCF: eNCF,
            FechaEmision: fechaEmision,
            FechaVencimientoSecuencia: fechaVencimiento,
            IndicadorMontoGravado: '1',
            TipoIngreso: (invoice as any).incomeType || '01',
          },
          Emisor: {
            RNCEmisor: tenantConfig.taxId || tenantConfig.rfc || '',
            RazonSocialEmisor: tenantConfig.legalName,
            NombreComercial: tenantConfig.brandName || tenantConfig.legalName,
            DireccionEmisor: tenantConfig.address || '',
            Municipio: tenantConfig.city || '',
            Provincia: tenantConfig.state || '',
          },
          Receptor: {
            RNCReceptor: customer.taxId,
            RazonSocialReceptor: customer.legalName,
            DireccionReceptor: customer.address || '',
            CodigoPostal: customer.postalCode || '',
          },
        },
        DetallesItems: {
          Item: items.map((item: any, index: number) => ({
            NumeroLinea: index + 1,
            IndicadorFacturacion: '1', // 1: Gravado con ITBIS, 2: Exento, etc.
            NombreItem: item.description,
            CantidadItem: item.quantity,
            UnidadMedida: item.unit || 'Und',
            PrecioUnitarioItem: Number(item.unitPrice).toFixed(2),
            MontoItem: Number(item.amount).toFixed(2),
            Impuestos: {
              ITBIS: Number(item.taxAmount).toFixed(2),
            },
          })),
        },
        Totales: {
          MontoTotal: Number(invoice.totalAmount).toFixed(2),
          MontoSubTotal: (Number(invoice.totalAmount) - Number(invoice.taxAmount || 0)).toFixed(2),
          MontoTotalImpuestos: Number(invoice.taxAmount || 0).toFixed(2),
          MontoItbisTotal: Number(invoice.taxAmount || 0).toFixed(2),
        },
      },
    };

    return `<?xml version="1.0" encoding="utf-8"?>\n${builder.build(eCFObj)}`;
  }
}
