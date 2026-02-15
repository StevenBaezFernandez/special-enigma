import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PayrollStatus } from '@virteex/contracts';
import {
  PayrollRepository,
  PAYROLL_REPOSITORY,
  PacProvider,
  PAC_PROVIDER,
  TenantConfigRepository,
  TENANT_CONFIG_REPOSITORY,
  PayrollStampedEvent,
  Payroll
} from '../../../../domain/src/index';
import { XMLBuilder } from 'fast-xml-parser';

@Injectable()
export class StampPayrollUseCase {
  private readonly logger = new Logger(StampPayrollUseCase.name);

  constructor(
    @Inject(PAYROLL_REPOSITORY) private readonly payrollRepository: PayrollRepository,
    @Inject(PAC_PROVIDER) private readonly pacProvider: PacProvider,
    @Inject(TENANT_CONFIG_REPOSITORY) private readonly tenantConfigRepo: TenantConfigRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(payrollId: string): Promise<Payroll> {
    const payroll = await this.payrollRepository.findById(payrollId);
    if (!payroll) {
      throw new NotFoundException(`Payroll ${payrollId} not found`);
    }

    if (payroll.status === PayrollStatus.PAID) {
        this.logger.warn(`Payroll ${payrollId} already stamped/paid`);
        return payroll;
    }

    const tenantConfig = await this.tenantConfigRepo.getFiscalConfig(payroll.tenantId);

    // Build XML
    const xml = this.buildPayrollXml(payroll, tenantConfig.rfc);

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

  private buildPayrollXml(payroll: Payroll, rfc: string): string {
    const builder = new XMLBuilder({
        ignoreAttributes: false,
        suppressEmptyNode: true
    });

    const formatDates = (date: Date | string) => {
        if (date instanceof Date) return date.toISOString().split('T')[0];
        return new Date(date).toISOString().split('T')[0];
    };

    const paymentDateStr = formatDates(payroll.paymentDate);
    const periodStartStr = formatDates(payroll.periodStart);
    const periodEndStr = formatDates(payroll.periodEnd);

    const employeeName = payroll.employee ? `${payroll.employee.firstName} ${payroll.employee.lastName}` : 'Desconocido';

    const xmlObj = {
        'cfdi:Comprobante': {
            '@_xmlns:cfdi': 'http://www.sat.gob.mx/cfd/4',
            '@_xmlns:nomina12': 'http://www.sat.gob.mx/nomina12',
            '@_Version': '4.0',
            '@_Serie': 'NOM',
            '@_Folio': payroll.id.substring(0, 8),
            '@_Fecha': new Date().toISOString(),
            '@_Sello': '',
            '@_NoCertificado': '',
            '@_Certificado': '',
            '@_SubTotal': payroll.totalEarnings,
            '@_Descuento': payroll.totalDeductions,
            '@_Moneda': 'MXN',
            '@_Total': payroll.netPay,
            '@_TipoDeComprobante': 'N',
            '@_Exportacion': '01',
            '@_LugarExpedicion': '00000',
            'cfdi:Emisor': {
                '@_Rfc': rfc,
                '@_Nombre': 'VIRTEEX EMPLOYER',
                '@_RegimenFiscal': '601'
            },
            'cfdi:Receptor': {
                '@_Rfc': 'XAXX010101000',
                '@_Nombre': employeeName,
                '@_DomicilioFiscalReceptor': '00000',
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
                    '@_NumDiasPagados': '15.000',
                    '@_TotalPercepciones': payroll.totalEarnings,
                    '@_TotalDeducciones': payroll.totalDeductions
                }
            }
        }
    };

    return builder.build(xmlObj);
  }
}
