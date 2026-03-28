import { PluginVersion } from './plugin-version.entity';

export class Plugin {
  id!: string;
  name!: string;
  description?: string;
  author?: string;
  status: PluginStatus = PluginStatus.ACTIVE;
  versions: PluginVersion[] = [];
  createdAt = new Date();
  updatedAt = new Date();
}

export enum PluginStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked',
  QUARANTINED = 'quarantined',
}
