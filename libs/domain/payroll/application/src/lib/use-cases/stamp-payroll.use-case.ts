import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PayrollStatus, PayrollDetailType } from '@virteex/domain-payroll-contracts';
import {
  PayrollRepository,
  PAYROLL_REPOSITORY,
  PacProvider,
  PAC_PROVIDER,
  TenantConfigRepository,
  TENANT_CONFIG_REPOSITORY,
  PayrollStampedEvent,
  Payroll
} from '@virteex/domain-payroll-domain';
import { XMLBuilder } from 'fast-xml-parser';
import { XsltService } from '@virteex/platform-xslt';
import * as crypto from 'crypto';
import { EntityNotFoundException } from '@virteex/kernel-exceptions';

@Injectable()
export class StampPayrollUseCase {
  private readonly logger = new Logger(StampPayrollUseCase.name);
  private readonly DEFAULT_UMA = 108.57; // 2024 UMA

  constructor(
    @Inject(PAYROLL_REPOSITORY) private readonly payrollRepository: PayrollRepository,
    @Inject(PAC_PROVIDER) private readonly pacProvider: PacProvider,
    @Inject(TENANT_CONFIG_REPOSITORY) private readonly tenantConfigRepo: TenantConfigRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly xsltService: XsltService
  ) {}

  async execute(payrollId: string): Promise<Payroll> {
    const payroll = await this.payrollRepository.findById(payrollId);
    if (!payroll) {
      throw new EntityNotFoundException('Payroll', payrollId);
    }

    if (payroll.status === PayrollStatus.PAID) {
        this.logger.warn(`Payroll ${payrollId} already stamped/paid`);
        return payroll;
    }

    const tenantConfig = await this.tenantConfigRepo.getFiscalConfig(payroll.tenantId);
    if (!tenantConfig.csdKey || !tenantConfig.csdCertificate) {
        throw new Error('Tenant fiscal configuration missing CSD credentials');
    }

    // Build XML
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const xml = await this.buildSignedPayrollXml(payroll, tenantConfig as any);

    // Stamp
    const stamp = await this.pacProvider.stamp(xml);

    // Update Payroll
    payroll.fiscalUuid = stamp.uuid;
    payroll.xmlContent = stamp.xml;
    payroll.stampedAt = new Date(stamp.fechaTimbrado);
    payroll.status = PayrollStatus.PAID;

    await this.payrollRepository.save(payroll);

    // Emit Event for Accounting Integration
    this.eventEmitter.emit(
        'payroll.stamped',
        new PayrollStampedEvent(
            payroll.id,
            payroll.tenantId,
            Number(payroll.netPay),
            Number(payroll.totalDeductions),
            new Date()
        )
    );

    return payroll;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async buildSignedPayrollXml(payroll: Payroll, tenantConfig: any): Promise<string> {
    const builder = new XMLBuilder({
        ignoreAttributes: false,
        suppressEmptyNode: true,
        format: true
    });

    const formatDates = (date: Date | string) => {
        if (date instanceof Date) return date.toISOString().split('T')[0];
        return new Date(date).toISOString().split('T')[0];
    };

    const paymentDateStr = formatDates(payroll.paymentDate);
    const periodStartStr = formatDates(payroll.periodStart);
    const periodEndStr = formatDates(payroll.periodEnd);

    if (!payroll.employee) {
        throw new Error('Payroll must be associated with an Employee');
    }

    const employeeName = `${payroll.employee.firstName} ${payroll.employee.lastName}`;

    // Categorize details
    const earnings = payroll.details.filter(d => d.type === PayrollDetailType.EARNING);
    const deductions = payroll.details.filter(d => d.type === PayrollDetailType.DEDUCTION);

    // Calculate Gravado/Exento
    const percepcionesData = earnings.map(e => {
        const satKey = this.mapConceptToSatKey(e.concept, 'EARNING');
        const amount = Number(e.amount);
        let exempt = 0;

        // Simple Logic for Exemptions (LISR)
        const conceptLower = e.concept.toLowerCase();
        if (conceptLower.includes('aguinaldo')) {
            // Exempt up to 30 UMA
            const limit = 30 * this.DEFAULT_UMA;
            exempt = Math.min(amount, limit);
        } else if (conceptLower.includes('prima vacacional')) {
            // Exempt up to 15 UMA
            const limit = 15 * this.DEFAULT_UMA;
            exempt = Math.min(amount, limit);
        }
        // Add more rules here as needed. Default is 0 exempt.

        const gravado = amount - exempt;

        return {
            key: satKey,
            concept: e.concept,
            gravado: gravado.toFixed(2),
            exento: exempt.toFixed(2),
            amount: amount.toFixed(2)
        };
    });

    const totalGravado = percepcionesData.reduce((sum, p) => sum + Number(p.gravado), 0).toFixed(2);
    const totalExento = percepcionesData.reduce((sum, p) => sum + Number(p.exento), 0).toFixed(2);

    const percepcionesNode = earnings.length > 0 ? {
        '@_TotalSueldos': payroll.totalEarnings, // Assuming all earnings are "Sueldos" for this node attribute simplification, usually implies Gravado+Exento
        '@_TotalGravado': totalGravado,
        '@_TotalExento': totalExento,
        'nomina12:Percepcion': percepcionesData.map(e => ({
            '@_TipoPercepcion': e.key,
            '@_Clave': '001', // Internal Key
            '@_Concepto': e.concept,
            '@_ImporteGravado': e.gravado,
            '@_ImporteExento': e.exento
        }))
    } : undefined;

    const deduccionesNode = deductions.length > 0 ? {
        '@_TotalOtrasDeducciones': '0.00',
        '@_TotalImpuestosRetenidos': deductions.filter(d => d.concept.toLowerCase().includes('isr')).reduce((sum, d) => sum + Number(d.amount), 0).toFixed(2),
        'nomina12:Deduccion': deductions.map(d => ({
            '@_TipoDeduccion': this.mapConceptToSatKey(d.concept, 'DEDUCTION'),
            '@_Clave': '002',
            '@_Concepto': d.concept,
            '@_Importe': d.amount
        }))
    } : undefined;

    const employeePostalCode = payroll.employee.postalCode || tenantConfig.postalCode;
    if (!payroll.employee.curp) {
        throw new Error(`Employee ${payroll.employee.id} missing CURP. Cannot stamp.`);
    }

    const xmlObj = {
        'cfdi:Comprobante': {
            '@_xmlns:cfdi': 'http://www.sat.gob.mx/cfd/4',
            '@_xmlns:nomina12': 'http://www.sat.gob.mx/nomina12',
            '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            '@_xsi:schemaLocation': 'http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd http://www.sat.gob.mx/nomina12 http://www.sat.gob.mx/sitio_internet/cfd/nomina/nomina12.xsd',
            '@_Version': '4.0',
            '@_Serie': 'NOM',
            '@_Folio': payroll.id.substring(0, 8),
            '@_Fecha': new Date().toISOString().split('.')[0],
            '@_Sello': '',
            '@_NoCertificado': tenantConfig.certificateNumber,
            '@_Certificado': tenantConfig.csdCertificate,
            '@_SubTotal': payroll.totalEarnings,
            '@_Descuento': payroll.totalDeductions,
            '@_Moneda': 'MXN',
            '@_Total': payroll.netPay,
            '@_TipoDeComprobante': 'N',
            '@_Exportacion': '01',
            '@_MetodoPago': 'PUE',
            '@_LugarExpedicion': tenantConfig.postalCode,
            'cfdi:Emisor': {
                '@_Rfc': tenantConfig.rfc,
                '@_Nombre': tenantConfig.legalName,
                '@_RegimenFiscal': tenantConfig.regime
            },
            'cfdi:Receptor': {
                '@_Rfc': payroll.employee.rfc || 'XAXX010101000',
                '@_Nombre': employeeName,
                '@_DomicilioFiscalReceptor': employeePostalCode,
                '@_RegimenFiscalReceptor': '605',
                '@_UsoCFDI': 'CN01'
            },
            'cfdi:Conceptos': {
                'cfdi:Concepto': {
                    '@_ClaveProdServ': '84111505',
                    '@_Cantidad': '1',
                    '@_ClaveUnidad': 'ACT',
                    '@_Descripcion': 'Pago de nómina',
                    '@_ValorUnitario': payroll.totalEarnings,
                    '@_Importe': payroll.totalEarnings,
                    '@_Descuento': payroll.totalDeductions,
                    '@_ObjetoImp': '01'
                }
            },
            'cfdi:Complemento': {
                'nomina12:Nomina': {
                    '@_Version': '1.2',
                    '@_TipoNomina': 'O',
                    '@_FechaPago': paymentDateStr,
                    '@_FechaInicialPago': periodStartStr,
                    '@_FechaFinalPago': periodEndStr,
                    '@_NumDiasPagados': '15.000', // Should be calculated
                    '@_TotalPercepciones': payroll.totalEarnings,
                    '@_TotalDeducciones': payroll.totalDeductions,
                    'nomina12:Percepciones': percepcionesNode,
                    'nomina12:Deducciones': deduccionesNode,
                    'nomina12:Receptor': {
                        '@_Curp': payroll.employee.curp,
                        '@_TipoContrato': payroll.employee.contractType || '01',
                        '@_TipoRegimen': payroll.employee.regimeType || '02',
                        '@_NumEmpleado': payroll.employee.id.substring(0, 10),
                        '@_PeriodicidadPago': payroll.employee.periodicity || '04',
                        '@_ClaveEntFed': 'CMX' // Hardcoded for now, should come from State of Address
                    }
                }
            }
        }
    };

    const xmlWithoutSello = builder.build(xmlObj);
    const xsltPath = 'libs/domains/billing/domain/src/lib/xslt/cadenaoriginal_4_0.xslt';
    let cadenaOriginal = '';
    try {
        cadenaOriginal = await this.xsltService.transform(xmlWithoutSello, xsltPath);
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        throw new Error(`Failed to generate Cadena Original for Payroll: ${message}`);
    }

    let sello = '';
    try {
        const sign = crypto.createSign('SHA256');
        sign.update(cadenaOriginal);
        sign.end();
        sello = sign.sign(tenantConfig.csdKey, 'base64');
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        throw new Error(`Failed to sign Payroll XML: ${message}`);
    }

    xmlObj['cfdi:Comprobante']['@_Sello'] = sello;
    return builder.build(xmlObj);
  }

  private mapConceptToSatKey(concept: string, type: 'EARNING' | 'DEDUCTION'): string {
      const c = concept.toLowerCase();
      if (type === 'EARNING') {
          if (c.includes('sueldo') || c.includes('salario')) return '001';
          if (c.includes('aguinaldo')) return '002';
          if (c.includes('vacacional')) return '020'; // Prima Vacacional
          return '038'; // Otros
      } else {
          if (c.includes('isr')) return '002';
          if (c.includes('imss') || c.includes('seguro')) return '001';
          return '004'; // Otros
      }
  }
}
