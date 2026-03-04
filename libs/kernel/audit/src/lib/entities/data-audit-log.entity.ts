import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class DataAuditLog {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property()
  entityType!: string;

  @Property()
  entityId!: string;

  @Property()
  operation!: string; // INSERT, UPDATE, DELETE

  @Property({ type: 'json', nullable: true })
  changes?: Record<string, any>;

  @Property({ nullable: true })
  userId?: string;

  @Property({ nullable: true })
  tenantId?: string;

  @Property()
  timestamp: Date = new Date();

  @Property({ nullable: true })
  previousHash?: string;

  @Property()
  hash!: string;

  constructor(
    entityType: string,
    entityId: string,
    operation: string,
    changes?: Record<string, any>,
    userId?: string,
    tenantId?: string
  ) {
    this.entityType = entityType;
    this.entityId = entityId;
    this.operation = operation;
    this.changes = changes;
    this.userId = userId;
    this.tenantId = tenantId;
  }
}
