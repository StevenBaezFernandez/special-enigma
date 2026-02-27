import { Entity, PrimaryKey, Property, ManyToOne, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { WarehouseOrmEntity } from './warehouse.orm-entity';

@Entity({ tableName: 'location' })
@Unique({ properties: ['warehouse', 'code'] })
export class LocationOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  tenantId!: string;

  @ManyToOne(() => WarehouseOrmEntity)
  warehouse!: WarehouseOrmEntity;

  @Property()
  code!: string;

  @Property()
  type!: string; // e.g., 'RACK', 'BIN', 'FLOOR'

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
