import { Entity, Property, PrimaryKey, Index } from '@mikro-orm/core';

@Entity()
export class MeteringRecord {
  @PrimaryKey()
  id!: string;

  @Index()
  @Property()
  tenantId!: string;

  @Index()
  @Property()
  pluginId!: string;

  @Property()
  pluginVersion!: string;

  @Property()
  executionTimeMs!: number;

  @Property()
  memoryBytes!: number;

  @Property()
  egressCount!: number;

  @Property()
  status!: 'success' | 'failure';

  @Property()
  timestamp = new Date();
}
