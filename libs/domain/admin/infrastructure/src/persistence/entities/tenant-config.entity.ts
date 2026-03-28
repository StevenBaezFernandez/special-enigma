import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'tenant_configs' })
export class OrmTenantConfig {
  @PrimaryKey()
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  key!: string;

  @Property()
  value!: string;
}
