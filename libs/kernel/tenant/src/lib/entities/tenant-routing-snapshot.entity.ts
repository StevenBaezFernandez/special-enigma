import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'tenant_routing_snapshots' })
export class TenantRoutingSnapshot {
  @PrimaryKey()
  tenantId!: string;

  @Property()
  generation!: number;

  @Property({ type: 'json' })
  routeTargets!: any;

  @Property()
  issuedAt: Date = new Date();

  @Property()
  signature!: string;
}
