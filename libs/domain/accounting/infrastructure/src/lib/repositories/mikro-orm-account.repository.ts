import { Injectable } from '@nestjs/common';
import { Account, AccountRepository } from '@virteex/domain-accounting-domain';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class MikroOrmAccountRepository implements AccountRepository {
  constructor(private readonly em: EntityManager) {}

  async create(account: Account): Promise<Account> {
    await this.em.persistAndFlush(account);
    return account;
  }

  async findById(id: string): Promise<Account | null> {
    return this.em.findOne(Account, { id });
  }

  async findByCode(tenantId: string, code: string): Promise<Account | null> {
    return this.em.findOne(Account, { tenantId, code });
  }

  async findAll(tenantId: string): Promise<Account[]> {
    return this.em.find(Account, { tenantId });
  }
}
