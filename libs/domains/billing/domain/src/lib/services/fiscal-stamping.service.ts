import { Injectable, Inject } from '@nestjs/common';
import { Invoice } from '../entities/invoice.entity';
import { FiscalStamp } from '../ports/pac-provider.port';
import { TenantConfigRepository, TENANT_CONFIG_REPOSITORY } from '../ports/tenant-config.port';
import { PacStrategyFactory, PAC_STRATEGY_FACTORY } from '../ports/pac-strategy.factory';
import { XMLBuilder } from 'fast-xml-parser';

@Injectable()
export class FiscalStampingService {
  constructor(
    @Inject(PAC_STRATEGY_FACTORY) private readonly pacStrategyFactory: PacStrategyFactory,
    @Inject(TENANT_CONFIG_REPOSITORY) private readonly tenantConfigRepo: TenantConfigRepository
  ) {}

  async stampInvoice(invoice: Invoice): Promise<FiscalStamp> {
    const tenantConfig = await this.tenantConfigRepo.getFiscalConfig(invoice.tenantId);
    const xml = this.generateXml(invoice, tenantConfig.rfc);

    const provider = this.pacStrategyFactory.getProvider(tenantConfig.country);
    return await provider.stamp(xml);
  }

  async cancelInvoice(uuid: string, tenantId: string): Promise<boolean> {
    const tenantConfig = await this.tenantConfigRepo.getFiscalConfig(tenantId);
    const provider = this.pacStrategyFactory.getProvider(tenantConfig.country);
    return await provider.cancel(uuid, tenantConfig.rfc);
  }

  private generateXml(invoice: Invoice, rfc: string): string {
    const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
        suppressEmptyNode: true
    });

    const items = invoice.items.getItems();

    const conceptos = items.map(item => ({
        '@_ClaveProdServ': item.productId || '01010101',
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
                     '@_TasaOCuota': '0.160000',
                     '@_Importe': item.taxAmount
                 }
             }
        }
    }));

    const cfdi = {
        'cfdi:Comprobante': {
            '@_xmlns:cfdi': 'http://www.sat.gob.mx/cfd/4',
            '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            '@_xsi:schemaLocation': 'http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd',
            '@_Version': '4.0',
            '@_Serie': 'A',
            '@_Folio': invoice.id.substring(0, 8),
            '@_Fecha': new Date().toISOString().split('.')[0],
            '@_Sello': '',
            '@_FormaPago': '99',
            '@_NoCertificado': '',
            '@_Certificado': '',
            '@_SubTotal': items.reduce((acc, item) => acc + Number(item.amount), 0).toFixed(2),
            '@_Moneda': 'MXN',
            '@_Total': invoice.totalAmount,
            '@_TipoDeComprobante': 'I',
            '@_Exportacion': '01',
            '@_MetodoPago': 'PPD',
            '@_LugarExpedicion': '00000',

            'cfdi:Emisor': {
                '@_Rfc': rfc,
                '@_Nombre': 'VIRTEEX DEMO',
                '@_RegimenFiscal': '601'
            },
            'cfdi:Receptor': {
                '@_Rfc': 'XAXX010101000',
                '@_Nombre': 'PUBLICO EN GENERAL',
                '@_DomicilioFiscalReceptor': '00000',
                '@_RegimenFiscalReceptor': '616',
                '@_UsoCFDI': 'G03'
            },
            'cfdi:Conceptos': {
                'cfdi:Concepto': conceptos
            },
            'cfdi:Impuestos': {
                '@_TotalImpuestosTrasladados': invoice.taxAmount,
                'cfdi:Traslados': {
                    'cfdi:Traslado': {
                        '@_Base': items.reduce((acc, item) => acc + Number(item.amount), 0).toFixed(2),
                        '@_Impuesto': '002',
                        '@_TipoFactor': 'Tasa',
                        '@_TasaOCuota': '0.160000',
                        '@_Importe': invoice.taxAmount
                    }
                }
            }
        }
    };

    return builder.build(cfdi);
  }
}
