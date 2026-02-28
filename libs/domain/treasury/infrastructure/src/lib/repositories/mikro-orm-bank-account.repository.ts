import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { BankAccount, BankAccountRepository } from '../../../../domain/src/index';

@Injectable()
export class MikroOrmBankAccountRepository implements BankAccountRepository {
  constructor(private readonly em: EntityManager) {}

  async create(bankAccount: BankAccount): Promise<BankAccount> {
    await this.em.persistAndFlush(bankAccount);
    return bankAccount;
  }

  async findById(id: string): Promise<BankAccount | null> {
    return this.em.findOne(BankAccount, { id });
  }

  async findAll(tenantId: string): Promise<BankAccount[]> {
    return this.em.find(BankAccount, { tenantId });
  }
}
