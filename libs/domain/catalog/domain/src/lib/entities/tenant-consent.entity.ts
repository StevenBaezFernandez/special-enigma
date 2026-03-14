import { Entity, Property, PrimaryKey, ManyToOne } from '@mikro-orm/core';
import { Plugin } from './plugin.entity';

@Entity()
export class TenantConsent {
  @PrimaryKey()
  id!: string;

  @Property()
  tenantId!: string;

  @ManyToOne('Plugin')
  plugin!: any;

  @Property({ type: 'json' })
  grantedCapabilities!: string[];

  @Property()
  grantedAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
}
