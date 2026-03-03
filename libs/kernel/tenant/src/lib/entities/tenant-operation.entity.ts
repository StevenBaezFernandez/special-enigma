import { Entity, PrimaryKey, Property, Enum, Index } from '@mikro-orm/core';
import { OperationType, OperationState } from '../interfaces/tenant-config.interface';
import { v4 as uuidv4 } from 'uuid';

@Entity({ tableName: 'tenant_operations' })
export class TenantOperation {
  @PrimaryKey()
  operationId: string = uuidv4();

  @Property()
  @Index()
  tenantId!: string;

  @Enum(() => OperationType)
  type!: OperationType;

  @Enum(() => OperationState)
  state!: OperationState;

  @Property({ unique: true })
  idempotencyKey!: string;

  @Property()
  startedAt: Date = new Date();

  @Property({ nullable: true })
  finishedAt?: Date;

  @Property({ type: 'json', nullable: true })
  result?: any;

  @Property({ nullable: true })
  evidenceUri?: string;
}
