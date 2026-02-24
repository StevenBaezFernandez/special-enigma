import { Injectable } from '@nestjs/common';
import { InvoiceRepository } from '@virteex/domain-billing-domain';
import { Invoice } from '@virteex/domain-billing-domain';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

@Injectable()
export class MikroOrmInvoiceRepository implements InvoiceRepository {
  constructor(
    @InjectRepository(Invoice)
    private readonly repository: EntityRepository<Invoice>
  ) {}

  async save(invoice: Invoice): Promise<void> {
    await this.repository.getEntityManager().persistAndFlush(invoice);
  }

  async findById(id: string): Promise<Invoice | null> {
    return this.repository.findOne({ id });
  }

  async findAll(): Promise<Invoice[]> {
      return this.repository.findAll();
  }

  async findByTenantId(tenantId: string): Promise<Invoice[]> {
    return this.repository.find({ tenantId });
  }

  async countByTenantId(tenantId: string): Promise<number> {
    return this.repository.count({ tenantId });
  }
}
