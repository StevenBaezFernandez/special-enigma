import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';
import { TenantMode, TenantStatus } from '../interfaces/tenant-config.interface';

@Entity({ tableName: 'tenant_control_records' })
export class TenantControlRecord {
  @PrimaryKey()
  tenantId!: string;

  @Enum(() => TenantMode)
  mode!: TenantMode;

  @Property()
  primaryRegion!: string;

  @Property()
  secondaryRegion!: string;

  @Property()
  complianceProfile!: string;

  @Property({ default: false })
  isFrozen = false;

  @Property({ nullable: true })
  writeFenceToken?: string;

  @Property({ default: 0 })
  fenceGeneration = 0;

  @Enum(() => TenantStatus)
  status: TenantStatus = TenantStatus.PROVISIONING;

  @Property({ version: true })
  version!: number;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
