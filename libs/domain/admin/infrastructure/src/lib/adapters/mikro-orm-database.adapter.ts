import { Injectable } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { DatabasePort } from '@virteex/domain-admin-domain';

@Injectable()
export class MikroOrmDatabaseAdapter implements DatabasePort {
  constructor(private readonly orm: MikroORM) {}

  getSchemaGenerator() {
    return this.orm.getSchemaGenerator();
  }

  getMigrator() {
    return this.orm.getMigrator();
  }

  forkEntityManager() {
    return this.orm.em.fork();
  }
}
