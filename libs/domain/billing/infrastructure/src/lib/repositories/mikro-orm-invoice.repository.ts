import { Injectable } from '@nestjs/common';
import { InvoiceRepository, Invoice } from '@virteex/domain-billing-domain';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { InvoiceRecord } from '../entities/invoice.record';
import { InvoiceMapper } from './invoice.mapper';

@Injectable()
export class MikroOrmInvoiceRepository implements InvoiceRepository {
  constructor(
    @InjectRepository(InvoiceRecord)
    private readonly repository: EntityRepository<InvoiceRecord>
  ) {}

  async save(invoice: Invoice): Promise<void> {
    const existing = await this.repository.findOne({ id: invoice.id }, { populate: ['items'] });
    const record = InvoiceMapper.toRecord(invoice, existing ?? undefined);
    await this.repository.getEntityManager().persistAndFlush(record);
  }

  async findById(id: string): Promise<Invoice | null> {
    const record = await this.repository.findOne({ id }, { populate: ['items'] });
    return record ? InvoiceMapper.toDomain(record) : null;
  }

  async findAll(): Promise<Invoice[]> {
    const records = await this.repository.findAll({ populate: ['items'] });
    return records.map((record) => InvoiceMapper.toDomain(record));
  }

  async findByTenantId(tenantId: string): Promise<Invoice[]> {
    const records = await this.repository.find({ tenantId }, { populate: ['items'] });
    return records.map((record) => InvoiceMapper.toDomain(record));
  }

  async countByTenantId(tenantId: string): Promise<number> {
    return this.repository.count({ tenantId });
  }
}
