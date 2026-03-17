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
    const entity = await this.em.findOne(UserOrmEntity, { email }, { populate: ['authenticators'] as any });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.em.findOne(UserOrmEntity, { id }, { populate: ['authenticators'] as any });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findBySocialId(provider: 'google' | 'microsoft' | 'okta', id: string): Promise<User | null> {
    const filter: any = {};
    if (provider === 'google') filter.googleId = id;
    else if (provider === 'microsoft') filter.microsoftId = id;
    else if (provider === 'okta') filter.oktaId = id;

    const entity = await this.em.findOne(UserOrmEntity, filter, { populate: ['authenticators'] as any });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async update(user: User): Promise<void> {
    await this.save(user);
  }
}
