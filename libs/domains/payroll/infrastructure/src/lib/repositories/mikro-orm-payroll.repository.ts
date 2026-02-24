import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { PayrollRepository, Payroll } from '@virteex/domain-payroll-domain';

@Injectable()
export class MikroOrmPayrollRepository implements PayrollRepository {
  constructor(private readonly em: EntityManager) {}

  async save(payroll: Payroll): Promise<void> {
    await this.em.persistAndFlush(payroll);
  }

  async findById(id: string): Promise<Payroll | null> {
    // MikroORM findOne accepts a primary key or partial entity as filter
    // If id is string and PK is uuid string, this should work.
    // If TS complains about FilterQuery, we might need to cast or ensure stricter type.
    // However, usually { id } works if id is a property.
    // If Payroll extends BaseEntity which has id, it should be fine.

    // Explicitly typing the filter to avoid mismatch or using "any" escape hatch if needed,
    // but better to fix entity definition if possible.
    // Assuming Payroll has 'id' property.
    return this.em.findOne(Payroll, { id } as any, { populate: ['employee', 'details'] });
  }

  async findAllByTenant(tenantId: string): Promise<Payroll[]> {
    return this.em.find(Payroll, { tenantId }, { populate: ['employee'] });
  }

  async findByEmployeeAndPeriod(employeeId: string, start: Date, end: Date): Promise<Payroll | null> {
    return this.em.findOne(Payroll, {
      employee: employeeId,
      periodStart: start,
      periodEnd: end
    } as any);
  }
}
