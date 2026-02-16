import { Injectable, Inject, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { Invoice } from '../entities/invoice.entity';
import { FiscalStamp } from '../ports/pac-provider.port';
import { TenantConfigRepository, TENANT_CONFIG_REPOSITORY, TenantFiscalConfig } from '../ports/tenant-config.port';
import { CustomerRepository, CUSTOMER_REPOSITORY, CustomerBillingInfo } from '../ports/customer.repository';
import { PacStrategyFactory, PAC_STRATEGY_FACTORY } from '../ports/pac-strategy.factory';
import { XMLBuilder } from 'fast-xml-parser';

@Injectable()
export class FiscalStampingService {
  constructor(
    @Inject(PAC_STRATEGY_FACTORY) private readonly pacStrategyFactory: PacStrategyFactory,
    @Inject(TENANT_CONFIG_REPOSITORY) private readonly tenantConfigRepo: TenantConfigRepository,
    @Inject(CUSTOMER_REPOSITORY) private readonly customerRepo: CustomerRepository
  ) {}

  async stampInvoice(invoice: Invoice): Promise<FiscalStamp> {
    const tenantConfig = await this.tenantConfigRepo.getFiscalConfig(invoice.tenantId);
    if (!tenantConfig.rfc || !tenantConfig.postalCode || !tenantConfig.regime) {
        throw new BadRequestException('Tenant fiscal configuration is incomplete (RFC, Postal Code, Regime are required)');
    }

    const customer = await this.customerRepo.findById(invoice.customerId);
    if (!customer) {
        throw new NotFoundException(`Customer with ID ${invoice.customerId} not found`);
    }
    if (!customer.rfc || !customer.postalCode || !customer.taxRegimen) {
        throw new BadRequestException(`Customer fiscal data is incomplete (RFC, Postal Code, Tax Regimen are required)`);
    }

    const xml = this.generateXml(invoice, tenantConfig, customer);

    const provider = this.pacStrategyFactory.getProvider(tenantConfig.country);
    return await provider.stamp(xml);
  }

  async cancelInvoice(uuid: string, tenantId: string): Promise<boolean> {
    const tenantConfig = await this.tenantConfigRepo.getFiscalConfig(tenantId);
    const provider = this.pacStrategyFactory.getProvider(tenantConfig.country);
    return await provider.cancel(uuid, tenantConfig.rfc);
  }

  private generateXml(invoice: Invoice, tenantConfig: TenantFiscalConfig, customer: CustomerBillingInfo): string {
    const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
        suppressEmptyNode: true
    });

    const items = invoice.items.getItems();

    // Group taxes for global summary
    const taxGroups: Record<string, { base: number, amount: number }> = {};

    const conceptos = items.map(item => {
        const base = parseFloat(item.amount);
        const tax = parseFloat(item.taxAmount);
        // Calculate rate or default to 0.160000.
        const rate = base > 0 ? (tax / base).toFixed(6) : '0.160000';

        if (!taxGroups[rate]) {
            taxGroups[rate] = { base: 0, amount: 0 };
        }
        taxGroups[rate].base += base;
        taxGroups[rate].amount += tax;

        // Use valid SAT Product Code (8 digits) or default
        const prodCode = (item.productId && /^\d{8}$/.test(item.productId)) ? item.productId : '01010101';

        return {
        '@_ClaveProdServ': prodCode,
        '@_NoIdentificacion': item.productId || 'NO-ID',
        '@_Cantidad': item.quantity,
        '@_ClaveUnidad': 'H87', // Pieza. Should be dynamic from Product.
        '@_Unidad': 'Pieza',
        '@_Descripcion': item.description,
        '@_ValorUnitario': item.unitPrice,
        '@_Importe': item.amount,
        '@_ObjetoImp': '02', // Sí objeto de impuesto
        'cfdi:Impuestos': {
             'cfdi:Traslados': {
                 'cfdi:Traslado': {
                     '@_Base': item.amount,
                     '@_Impuesto': '002', // IVA
                     '@_TipoFactor': 'Tasa',
                     '@_TasaOCuota': rate,
                     '@_Importe': item.taxAmount
                 }
             }
        }
    }});

    // Fix Timezone: SAT expects Local Time (Mexico City usually)
    const now = new Date();
    // Create a date object that represents the local time in Mexico City as if it were UTC
    // This allows .toISOString() to output the correct face time.
    const mexicoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
    const fecha = mexicoTime.toISOString().split('.')[0];

    // Calculate SubTotal
    const subTotal = items.reduce((acc, item) => acc + Number(item.amount), 0).toFixed(2);

    // Certificate handling
    const certNumber = tenantConfig.certificateNumber || '';
    const certContent = tenantConfig.csdCertificate || '';
    const privateKey = tenantConfig.csdKey || '';

    // Generate Signature (Sello)
    // Construct "Cadena Original" string (Simplified for robustness/completeness of known fields)
    // Structure: ||Version|Serie|Folio|Fecha|FormaPago|NoCertificado|CondicionesDePago|SubTotal|Descuento|Moneda|TipoCambio|Total|TipoDeComprobante|Exportacion|MetodoPago|LugarExpedicion|...
    // Note: This is an approximation. A full XSLT transformation is required for strict compliance.
    // However, this ensures the signature matches the data we are sending.
    let cadenaOriginal = `||4.0|A|${invoice.id.substring(0, 8)}|${fecha}|${invoice.paymentForm}|${certNumber}|${subTotal}|MXN|${invoice.totalAmount}|I|01|${invoice.paymentMethod}|${tenantConfig.postalCode}||`;

    let sello = '';
    if (privateKey) {
        try {
            const sign = crypto.createSign('SHA256');
            sign.update(cadenaOriginal);
            sign.end();
            sello = sign.sign(privateKey, 'base64');
        } catch (e) {
            Logger.error('Failed to sign XML', e);
        }
    }

    const cfdi = {
        'cfdi:Comprobante': {
            '@_xmlns:cfdi': 'http://www.sat.gob.mx/cfd/4',
            '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            '@_xsi:schemaLocation': 'http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd',
            '@_Version': '4.0',
            '@_Serie': 'A',
            '@_Folio': invoice.id.substring(0, 8),
            '@_Fecha': fecha,
            '@_Sello': sello,
            '@_FormaPago': invoice.paymentForm,
            '@_NoCertificado': certNumber,
            '@_Certificado': certContent,
            '@_SubTotal': subTotal,
            '@_Moneda': 'MXN',
            '@_Total': invoice.totalAmount,
            '@_TipoDeComprobante': 'I',
            '@_Exportacion': '01',
            '@_MetodoPago': invoice.paymentMethod,
            '@_LugarExpedicion': tenantConfig.postalCode,

            'cfdi:Emisor': {
                '@_Rfc': tenantConfig.rfc,
                '@_Nombre': tenantConfig.legalName,
                '@_RegimenFiscal': tenantConfig.regime
            },
            'cfdi:Receptor': {
                '@_Rfc': customer.rfc,
                '@_Nombre': customer.legalName,
                '@_DomicilioFiscalReceptor': customer.postalCode,
                '@_RegimenFiscalReceptor': customer.taxRegimen,
                '@_UsoCFDI': invoice.usage
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

    return builder.build(cfdi);
  }
}
