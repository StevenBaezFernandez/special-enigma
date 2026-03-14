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
    // Level 5: Executable invariant check before persistence
    if (parseFloat(invoice.totalAmount) < 0) {
        throw new Error(`Inconsistency: Invoice ${invoice.id} has negative total amount: ${invoice.totalAmount}`);
    }
    // Level 5: Dual-write avoidance. Invariants are checked before persistence.
    // distributed consistency is handled by the Outbox Pattern (separate process).
    this.validateInvoiceTenantIntegrity(invoice);
    const existing = await this.repository.findOne({ id: invoice.id }, { populate: ['items'] });
    const record = InvoiceMapper.toRecord(invoice, existing ?? undefined);
    await this.repository.getEntityManager().persistAndFlush(record);
  }

  private validateInvoiceTenantIntegrity(invoice: Invoice): void {
    if (!invoice.tenantId || invoice.tenantId.trim().length === 0) {
      throw new Error(`Inconsistency: Invoice ${invoice.id} is missing tenantId`);
    }
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
