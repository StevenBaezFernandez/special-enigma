import { Entity, Property, PrimaryKey, Enum, OneToMany, Collection } from '@mikro-orm/core';
import { PluginVersion } from './plugin-version.entity';

@Entity()
export class Plugin {
  @PrimaryKey()
  id!: string;

  @Property()
  name!: string;

  @Property()
  description?: string;

  @Property()
  author?: string;

  @Enum(() => PluginStatus)
  status: PluginStatus = PluginStatus.ACTIVE;

  @OneToMany(() => PluginVersion, version => version.plugin)
  versions = new Collection<PluginVersion>(this);

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();
}

export enum PluginStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked',
  QUARANTINED = 'quarantined',
}
