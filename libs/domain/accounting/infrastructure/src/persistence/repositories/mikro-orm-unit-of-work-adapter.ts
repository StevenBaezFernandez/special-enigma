import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/knex';
import { IUnitOfWork } from '@virteex/domain-accounting-application';

@Injectable()
export class MikroOrmUnitOfWorkAdapter implements IUnitOfWork {
  constructor(private readonly em: EntityManager) {}

  async transactional<T>(fn: () => Promise<T>): Promise<T> {
    return this.em.transactional(fn);
  }
}
