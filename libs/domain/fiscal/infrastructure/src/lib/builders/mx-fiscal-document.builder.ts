import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { XMLBuilder } from 'fast-xml-parser';
import { XsltService } from '@virteex/platform-xslt';
import { FiscalDocumentBuilder } from '@virteex/domain-fiscal-domain';
import { TenantFiscalConfig } from '@virteex/domain-fiscal-domain';
import { InvoiceContract, CustomerBillingInfoContract } from '@virteex/domain-billing-contracts';

@Injectable()
export class MxFiscalDocumentBuilder implements FiscalDocumentBuilder {
  constructor(private readonly xsltService: XsltService) {}

  async build(invoice: InvoiceContract, tenantConfig: TenantFiscalConfig, customer: CustomerBillingInfoContract): Promise<string> {
    const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
        suppressEmptyNode: true
    });

    // In a real implementation, we would need to fetch items through a port or pass them in the contract
    // For now, assume contract is extended or we use any to bypass strict type check on items for this refactor
    const items = (invoice as any).items || [];
    const taxGroups: Record<string, { base: number, amount: number }> = {};

    const conceptos = items.map((item: any) => {
        const base = Number(item.amount);
        const tax = Number(item.taxAmount);
        const rate = base > 0 ? (tax / base).toFixed(6) : '0.160000';

        if (!taxGroups[rate]) {
            taxGroups[rate] = { base: 0, amount: 0 };
        }
        taxGroups[rate].base += base;
        taxGroups[rate].amount += tax;

        const prodCode = (item.productId && /^\d{8}$/.test(item.productId)) ? item.productId : '01010101';

        return {
        '@_ClaveProdServ': prodCode,
        '@_NoIdentificacion': item.productId || 'NO-ID',
        '@_Cantidad': item.quantity,
        '@_ClaveUnidad': 'H87',
        '@_Unidad': 'Pieza',
        '@_Descripcion': item.description,
        '@_ValorUnitario': item.unitPrice,
        '@_Importe': item.amount,
        '@_ObjetoImp': '02',
        'cfdi:Impuestos': {
             'cfdi:Traslados': {
                 'cfdi:Traslado': {
                     '@_Base': item.amount,
                     '@_Impuesto': '002',
                     '@_TipoFactor': 'Tasa',
                     '@_TasaOCuota': rate,
                     '@_Importe': item.taxAmount
                 }
             }
        }
    }});

    const now = new Date();
    const mexicoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
    const fecha = mexicoTime.toISOString().split('.')[0];

    const subTotal = items.reduce((acc: number, item: any) => acc + Number(item.amount), 0).toFixed(2);

    const certNumber = tenantConfig.certificateNumber || '';
    const certContent = tenantConfig.csdCertificate || '';
    const privateKey = tenantConfig.csdKey || '';

    const cfdiObj = {
        'cfdi:Comprobante': {
            '@_xmlns:cfdi': 'http://www.sat.gob.mx/cfd/4',
            '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            '@_xsi:schemaLocation': 'http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd',
            '@_Version': '4.0',
            '@_Serie': 'A',
            '@_Folio': invoice.id.substring(0, 8),
            '@_Fecha': fecha,
            '@_Sello': '',
            '@_FormaPago': (invoice as any).paymentForm || '01',
            '@_NoCertificado': certNumber,
            '@_Certificado': certContent,
            '@_SubTotal': subTotal,
            '@_Moneda': 'MXN',
            '@_Total': invoice.totalAmount,
            '@_TipoDeComprobante': 'I',
            '@_Exportacion': '01',
            '@_MetodoPago': (invoice as any).paymentMethod || 'PUE',
            '@_LugarExpedicion': tenantConfig.postalCode,

            'cfdi:Emisor': {
                '@_Rfc': tenantConfig.rfc,
                '@_Nombre': tenantConfig.legalName,
                '@_RegimenFiscal': tenantConfig.regime
            },
            'cfdi:Receptor': {
                '@_Rfc': customer.taxId,
                '@_Nombre': customer.legalName,
                '@_DomicilioFiscalReceptor': customer.postalCode,
                '@_RegimenFiscalReceptor': (customer as any).taxRegimen || '601',
                '@_UsoCFDI': (invoice as any).usage || 'G03'
            },
            'cfdi:Conceptos': {
                'cfdi:Concepto': conceptos
            },
            'cfdi:Impuestos': {
                '@_TotalImpuestosTrasladados': invoice.taxAmount,
                'cfdi:Traslados': {
                    'cfdi:Traslado': Object.entries(taxGroups).map(([rate, group]) => ({
                        '@_Base': group.base.toFixed(2),
                        '@_Impuesto': '002',
                        '@_TipoFactor': 'Tasa',
                        '@_TasaOCuota': rate,
                        '@_Importe': group.amount.toFixed(2)
                    }))
                }
            }
        }
    };

    const xmlWithoutSello = builder.build(cfdiObj);
    const xsltPath = 'libs/domains/fiscal/domain/src/lib/xslt/cadenaoriginal_4_0.xslt';

    let cadenaOriginal = '';
    try {
        cadenaOriginal = await this.xsltService.transform(xmlWithoutSello, xsltPath);
    } catch (e) {
        throw new Error(`Failed to generate Cadena Original: ${e}`);
    }

    let sello = '';
    if (privateKey) {
        try {
            const sign = crypto.createSign('SHA256');
            sign.update(cadenaOriginal);
            sign.end();
            sello = sign.sign(privateKey, 'base64');
        } catch (e) {
            Logger.error('Failed to sign XML', e);
            throw new Error(`Failed to sign XML: ${e}`);
        }
    } else {
        throw new Error('Private key is missing for signing');
    }

    cfdiObj['cfdi:Comprobante']['@_Sello'] = sello;
    return builder.build(cfdiObj);
  }
}
