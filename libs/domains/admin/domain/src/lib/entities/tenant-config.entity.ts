import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class TenantConfig {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  key!: string;

  @Property()
  value!: string;

  constructor(tenantId: string, key: string, value: string) {
    this.tenantId = tenantId;
    this.key = key;
    this.value = value;
  }
}
