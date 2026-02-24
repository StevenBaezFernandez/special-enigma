import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { EmployeeRepository, Employee } from '@virteex/domain-payroll-domain';

@Injectable()
export class MikroOrmEmployeeRepository implements EmployeeRepository {
  constructor(private readonly em: EntityManager) {}

  async save(employee: Employee): Promise<void> {
    await this.em.persistAndFlush(employee);
  }

  async findById(id: string): Promise<Employee | null> {
    return this.em.findOne(Employee, { id });
  }

  async findByEmail(email: string): Promise<Employee | null> {
    return this.em.findOne(Employee, { email });
  }

  async findAllByTenant(tenantId: string): Promise<Employee[]> {
    return this.em.find(Employee, { tenantId });
  }
}
