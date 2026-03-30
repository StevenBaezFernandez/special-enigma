import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import type { UnitOfWorkPort } from '@virteex/domain-identity-domain';

@Injectable()
export class MikroOrmUnitOfWorkAdapter implements UnitOfWorkPort {
  constructor(private readonly em: EntityManager) {}

  runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    return this.em.transactional(async () => work());
  }
}
