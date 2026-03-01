import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity({ schema: 'identity', tableName: 'audit_log' })
export class AuditLogOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property({ nullable: true })
  userId?: string;

  @Property()
  event!: string;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Property()
  timestamp: Date = new Date();

  @Property({ nullable: true })
  hash?: string;

  @Property({ nullable: true })
  previousHash?: string;
}
