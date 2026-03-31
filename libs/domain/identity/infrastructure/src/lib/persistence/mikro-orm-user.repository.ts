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

  async findById(id: string, tenantId?: string): Promise<User | null> {
    const where: any = { id };
    if (tenantId) {
      where.company = tenantId;
    }
    const entity = await this.em.findOne(UserOrmEntity, where, { populate: ['authenticators'] as any });
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

  async findByAuthenticatorCredentialId(credentialId: string): Promise<User | null> {
    // This is a simplified implementation. In a real scenario, you would query the authenticators collection.
    // Assuming the underlying database supports querying by nested property or there is a join.
    const entity = await this.em.findOne(UserOrmEntity, {
      authenticators: { credentialID: credentialId } as any
    }, { populate: ['authenticators'] as any });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByInvitationToken(token: string): Promise<User | null> {
    const entity = await this.em.findOne(UserOrmEntity, { invitationToken: token }, { populate: ['authenticators'] as any });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByResetPasswordToken(token: string): Promise<User | null> {
    const entity = await this.em.findOne(UserOrmEntity, { resetPasswordToken: token }, { populate: ['authenticators'] as any });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findAll(options: {
    page: number;
    pageSize: number;
    searchTerm?: string;
    statusFilter?: string;
    sortColumn?: string;
    sortDirection?: 'ASC' | 'DESC';
    tenantId?: string;
  }): Promise<{ data: User[]; total: number }> {
    const { page, pageSize, searchTerm, statusFilter, sortColumn, sortDirection, tenantId } = options;

    const where: any = {};

    if (tenantId) {
      where.company = tenantId;
    }

    if (statusFilter && statusFilter !== 'all') {
      where.status = statusFilter;
    }

    if (searchTerm) {
      where.$or = [
        { firstName: { $ilike: `%${searchTerm}%` } },
        { lastName: { $ilike: `%${searchTerm}%` } },
        { email: { $ilike: `%${searchTerm}%` } },
      ];
    }

    const [entities, total] = await this.em.findAndCount(UserOrmEntity, where, {
      limit: pageSize,
      offset: (page - 1) * pageSize,
      orderBy: sortColumn ? { [sortColumn]: sortDirection || 'ASC' } : { createdAt: 'DESC' },
      populate: ['company'] as any,
    });

    return {
      data: entities.map((e) => UserMapper.toDomain(e)),
      total,
    };
  }

  async delete(id: string, tenantId?: string): Promise<void> {
    const where: any = { id };
    if (tenantId) {
      where.company = tenantId;
    }
    const entity = await this.em.findOne(UserOrmEntity, where);
    if (entity) {
      await this.em.removeAndFlush(entity);
    }
  }
}
