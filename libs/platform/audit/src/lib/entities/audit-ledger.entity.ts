import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity({ tableName: 'audit_ledger' })
export class AuditLedger {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  tenantId!: string;

  @Property()
  userId!: string;

  @Property()
  action!: string;

  @Property({ type: 'json' })
  details!: any;

  @Property()
  previousHash!: string;

  @Property()
  hash!: string;

  @Property()
  @Index()
  createdAt: Date = new Date();
}
