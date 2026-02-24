import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User, UserRepository } from '@virteex/domain-identity-domain';
import { UserOrmEntity } from './entities/user.orm-entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class MikroOrmUserRepository implements UserRepository {
  constructor(private readonly em: EntityManager) {}

  async save(user: User): Promise<void> {
    const entity = UserMapper.toPersistence(user);
    // Upsert handles both insert and update based on primary key
    await this.em.upsert(UserOrmEntity, entity);
    await this.em.flush();
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.em.findOne(UserOrmEntity, { email });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.em.findOne(UserOrmEntity, { id });
    return entity ? UserMapper.toDomain(entity) : null;
  }
}
