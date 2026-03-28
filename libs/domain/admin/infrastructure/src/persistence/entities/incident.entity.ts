import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';
import { IncidentSeverity, IncidentStatus } from '@virteex/domain-admin-domain';

@Entity({ tableName: 'incidents' })
export class OrmIncident {
  @PrimaryKey()
  id!: string;

  @Property()
  title!: string;

  @Enum(() => IncidentSeverity)
  severity!: IncidentSeverity;

  @Enum(() => IncidentStatus)
  status!: IncidentStatus;

  @Property()
  service!: string;

  @Property({ nullable: true })
  tenantId?: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
