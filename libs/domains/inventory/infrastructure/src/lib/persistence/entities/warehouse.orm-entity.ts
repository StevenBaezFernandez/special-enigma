import { Entity, PrimaryKey, Property, OneToMany, Collection, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { LocationOrmEntity } from './location.orm-entity';

@Entity({ tableName: 'warehouse' })
@Unique({ properties: ['tenantId', 'code'] })
export class WarehouseOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  tenantId!: string;

  @Property()
  code!: string;

  @Property()
  name!: string;

  @Property({ nullable: true })
  address?: string;

  @Property({ nullable: true })
  description?: string;

  @Property()
  isActive = true;

  @OneToMany(() => LocationOrmEntity, 'warehouse')
  locations = new Collection<LocationOrmEntity>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
