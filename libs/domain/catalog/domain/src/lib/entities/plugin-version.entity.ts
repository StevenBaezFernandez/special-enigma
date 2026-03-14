import { Entity, Property, PrimaryKey, ManyToOne, Enum } from '@mikro-orm/core';
import { Plugin } from './plugin.entity';

@Entity()
export class PluginVersion {
  @PrimaryKey()
  id!: string;

  @ManyToOne('Plugin')
  plugin!: any;

  @Property()
  version!: string;

  @Property({ columnType: 'text' })
  code!: string;

  @Property({ type: 'json' })
  capabilities?: string[];

  @Property({ type: 'json' })
  sbom?: any;

  @Property()
  signature?: string;

  @Enum(() => PluginChannel)
  channel: PluginChannel = PluginChannel.STABLE;

  @Property()
  createdAt = new Date();
}

export enum PluginChannel {
  STABLE = 'stable',
  BETA = 'beta',
  DEPRECATED = 'deprecated',
}
