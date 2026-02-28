import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Transaction } from '../../../../domain/src/lib/entities/transaction.entity';
import { TransactionRepository } from '../../../../domain/src/lib/repositories/transaction.repository';

@Injectable()
export class MikroOrmTransactionRepository implements TransactionRepository {
  constructor(private readonly em: EntityManager) {}

  async create(transaction: Transaction): Promise<Transaction> {
    this.em.persist(transaction);
    await this.em.flush();
    return transaction;
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.em.findOne(Transaction, { id });
  }

  async findAll(tenantId: string): Promise<Transaction[]> {
    return this.em.find(Transaction, { tenantId }, { orderBy: { date: 'DESC' } });
  }

  async getCashFlowReport(tenantId: string, startDate: Date, endDate: Date): Promise<any[]> {
    const qb = this.em.createQueryBuilder(Transaction, 't');
    const results = await qb
      .select([
        'DATE(t.date) as date',
        "SUM(CASE WHEN t.type = 'DEPOSIT' THEN t.amount ELSE 0 END) as income",
        "SUM(CASE WHEN t.type = 'WITHDRAWAL' THEN t.amount ELSE 0 END) as expense"
      ])
      .where({ tenantId })
      .andWhere('t.date >= ?', [startDate])
      .andWhere('t.date <= ?', [endDate])
      .groupBy('DATE(t.date)')
      .orderBy({ 'DATE(t.date)': 'ASC' })
      .execute();

    return results;
  }
}
