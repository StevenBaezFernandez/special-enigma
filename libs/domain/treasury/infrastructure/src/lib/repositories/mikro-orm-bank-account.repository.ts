import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BankAccount, BankAccountRepository } from '@virteex/domain-treasury-domain';

@Injectable()
export class MikroOrmBankAccountRepository implements BankAccountRepository {
  constructor(private readonly em: EntityManager) {}

  async save(bankAccount: BankAccount): Promise<void> {
    await this.em.persistAndFlush(bankAccount);
  }

  async findById(id: string): Promise<BankAccount | null> {
    return this.em.findOne(BankAccount, { id });
  }

  async findAll(tenantId: string): Promise<BankAccount[]> {
    return this.em.find(BankAccount, { tenantId });
  }
}
