import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core'; // Changed from @mikro-orm/postgresql to @mikro-orm/core for driver agnostic
import { SatPaymentForm, SatPaymentMethod, SatCfdiUsage } from '@virteex/domain-catalog-domain';

@Injectable()
export class CatalogSeederService {
  private readonly logger = new Logger(CatalogSeederService.name);

  constructor(private readonly em: EntityManager) {}

  async seed() {
    this.logger.log('Checking if catalog data seeding is required...');
    // Create a fork to use a dedicated context for seeding, avoiding global EM validation issues
    const em = this.em.fork();

    // Payment Forms
    const formCount = await em.count(SatPaymentForm, {});
    if (formCount === 0) {
      this.logger.log('Seeding SAT Payment Forms...');
      const forms = [
        { code: '01', name: 'Efectivo' },
        { code: '02', name: 'Cheque nominativo' },
        { code: '03', name: 'Transferencia electrónica de fondos' },
        { code: '04', name: 'Tarjeta de crédito' },
        { code: '05', name: 'Monedero electrónico' },
        { code: '06', name: 'Dinero electrónico' },
        { code: '08', name: 'Vales de despensa' },
        { code: '12', name: 'Dación en pago' },
        { code: '13', name: 'Pago por subrogación' },
        { code: '14', name: 'Pago por consignación' },
        { code: '15', name: 'Condonación' },
        { code: '17', name: 'Compensación' },
        { code: '23', name: 'Novación' },
        { code: '24', name: 'Confusión' },
        { code: '25', name: 'Remisión de deuda' },
        { code: '26', name: 'Prescripción o caducidad' },
        { code: '27', name: 'A satisfacción del acreedor' },
        { code: '28', name: 'Tarjeta de débito' },
        { code: '29', name: 'Tarjeta de servicios' },
        { code: '30', name: 'Aplicación de anticipos' },
        { code: '31', name: 'Intermediario pagos' },
        { code: '99', name: 'Por definir' },
      ];
      for (const f of forms) {
        const entity = new SatPaymentForm();
        entity.code = f.code;
        entity.name = f.name;
        em.persist(entity);
      }
    }

    // Payment Methods
    const methodCount = await em.count(SatPaymentMethod, {});
    if (methodCount === 0) {
      this.logger.log('Seeding SAT Payment Methods...');
      const methods = [
        { code: 'PUE', name: 'Pago en una sola exhibición' },
        { code: 'PPD', name: 'Pago en parcialidades o diferido' },
      ];
      for (const m of methods) {
        const entity = new SatPaymentMethod();
        entity.code = m.code;
        entity.name = m.name;
        em.persist(entity);
      }
    }

    // CFDI Usages
    const usageCount = await em.count(SatCfdiUsage, {});
    if (usageCount === 0) {
      this.logger.log('Seeding SAT CFDI Usages...');
      const usages = [
        { code: 'G01', name: 'Adquisición de mercancías' },
        { code: 'G02', name: 'Devoluciones, descuentos o bonificaciones' },
        { code: 'G03', name: 'Gastos en general' },
        { code: 'I01', name: 'Construcciones' },
        { code: 'I02', name: 'Mobiliario y equipo de oficina por inversiones' },
        { code: 'I03', name: 'Equipo de transporte' },
        { code: 'I04', name: 'Equipo de computo y accesorios' },
        { code: 'I05', name: 'Dados, troqueles, moldes, matrices y herramental' },
        { code: 'I06', name: 'Comunicaciones telefónicas' },
        { code: 'I07', name: 'Comunicaciones satelitales' },
        { code: 'I08', name: 'Otra maquinaria y equipo' },
        { code: 'D01', name: 'Honorarios médicos, dentales y gastos hospitalarios' },
        { code: 'D02', name: 'Gastos médicos por incapacidad o discapacidad' },
        { code: 'D03', name: 'Gastos funerales' },
        { code: 'D04', name: 'Donativos' },
        { code: 'D05', name: 'Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación)' },
        { code: 'D06', name: 'Aportaciones voluntarias al SAR' },
        { code: 'D07', name: 'Primas por seguros de gastos médicos' },
        { code: 'D08', name: 'Gastos de transportación escolar obligatoria' },
        { code: 'D09', name: 'Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones' },
        { code: 'D10', name: 'Pagos por servicios educativos (colegiaturas)' },
        { code: 'S01', name: 'Sin efectos fiscales' },
        { code: 'CP01', name: 'Pagos' },
        { code: 'CN01', name: 'Nómina' },
      ];
      for (const u of usages) {
        const entity = new SatCfdiUsage();
        entity.code = u.code;
        entity.name = u.name;
        em.persist(entity);
      }
    }

    await em.flush();
    this.logger.log('Catalog seeding complete.');
  }
}
