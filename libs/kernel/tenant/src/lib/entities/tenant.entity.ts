import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';
import { TenantMode } from '../interfaces/tenant-config.interface';

@Entity({ tableName: 'tenants' }) // Central catalog table
export class Tenant {
  @PrimaryKey()
  id!: string; // Using string as tenantId

  @Enum(() => TenantMode)
  mode: TenantMode = TenantMode.SHARED;

  @Property({ nullable: true })
  connectionString?: string; // For DATABASE mode

  @Property({ nullable: true })
  schemaName?: string; // For SCHEMA mode

  @Property({ type: 'json', nullable: true })
  settings?: Record<string, any>;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
