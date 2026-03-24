import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Transaction, TransactionRepository } from '../../../../domain/src';

@Injectable()
export class MikroOrmTransactionRepository implements TransactionRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<Transaction | null> {
    return this.em.findOne(Transaction, { id } as any);
  }

  async save(transaction: Transaction): Promise<void> {
    await this.em.persistAndFlush(transaction);
  }

  async findAll(tenantId: string): Promise<Transaction[]> {
    return this.em.find(Transaction, { tenantId } as any);
  }

  async findByBankAccountId(bankAccountId: string): Promise<Transaction[]> {
    return this.em.find(Transaction, { bankAccount: bankAccountId } as any);
  }

  async getCashFlowReport(tenantId: string, startDate: Date, endDate: Date): Promise<any[]> {
    const qb = this.em.createQueryBuilder(Transaction, 't');

    return qb
      .select(['date', 'type', 'SUM(amount) as total'])
      .where({
        tenantId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      } as any)
      .groupBy(['date', 'type'])
      .orderBy({ date: 'ASC' })
      .execute();
  }
}
