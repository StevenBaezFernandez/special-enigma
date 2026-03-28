import { Plugin } from './plugin.entity';

export class PluginVersion {
  id!: string;
  plugin!: Plugin;
  version!: string;
  code!: string;
  capabilities?: string[];
  sbom?  : any;
  signature?: string;
  channel: PluginChannel = PluginChannel.STABLE;
  createdAt = new Date();
}

export enum PluginChannel {
  STABLE = 'stable',
  BETA = 'beta',
  DEPRECATED = 'deprecated',
}
