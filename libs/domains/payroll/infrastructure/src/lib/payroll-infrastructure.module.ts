import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import {
  TaxTable,
  Employee,
  Payroll,
  Attendance,
  PayrollDetail,
  EMPLOYEE_REPOSITORY,
  PAYROLL_REPOSITORY,
  TAX_TABLE_REPOSITORY,
  TAX_STRATEGY_FACTORY,
  ATTENDANCE_REPOSITORY,
  PAC_PROVIDER,
  TENANT_CONFIG_REPOSITORY
} from '@virteex/payroll-domain';
import { MikroOrmEmployeeRepository } from './repositories/mikro-orm-employee.repository';
import { MikroOrmPayrollRepository } from './repositories/mikro-orm-payroll.repository';
import { MikroOrmTaxTableRepository } from './repositories/mikro-orm-tax-table.repository';
import { MikroOrmAttendanceRepository } from './repositories/mikro-orm-attendance.repository';
import { MexicanTaxStrategy } from './strategies/mexican-tax.strategy';
import { USPayrollStrategy } from './strategies/us-payroll.strategy';
import { TaxStrategyFactoryImpl } from './factories/tax-strategy.factory';
import { FinkokPacProvider } from './providers/finkok-pac.provider';
import { MikroOrmTenantConfigRepository } from './repositories/mikro-orm-tenant-config.repository';

@Module({
  imports: [MikroOrmModule.forFeature([TaxTable, Employee, Payroll, Attendance, PayrollDetail])],
  providers: [
    { provide: EMPLOYEE_REPOSITORY, useClass: MikroOrmEmployeeRepository },
    { provide: PAYROLL_REPOSITORY, useClass: MikroOrmPayrollRepository },
    { provide: TAX_TABLE_REPOSITORY, useClass: MikroOrmTaxTableRepository },
    { provide: ATTENDANCE_REPOSITORY, useClass: MikroOrmAttendanceRepository },
    { provide: PAC_PROVIDER, useClass: FinkokPacProvider },
    { provide: TENANT_CONFIG_REPOSITORY, useClass: MikroOrmTenantConfigRepository },
    MexicanTaxStrategy,
    USPayrollStrategy,
    { provide: TAX_STRATEGY_FACTORY, useClass: TaxStrategyFactoryImpl }
  ],
  exports: [
    EMPLOYEE_REPOSITORY,
    PAYROLL_REPOSITORY,
    TAX_TABLE_REPOSITORY,
    ATTENDANCE_REPOSITORY,
    PAC_PROVIDER,
    TENANT_CONFIG_REPOSITORY,
    TAX_STRATEGY_FACTORY,
    MexicanTaxStrategy,
    USPayrollStrategy
  ],
})
export class PayrollInfrastructureModule {}
