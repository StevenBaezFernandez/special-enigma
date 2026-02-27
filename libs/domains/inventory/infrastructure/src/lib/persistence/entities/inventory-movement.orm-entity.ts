import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { WarehouseOrmEntity } from './warehouse.orm-entity';
import { LocationOrmEntity } from './location.orm-entity';
import { InventoryMovementType } from '@virteex/domain-inventory-domain';

@Entity({ tableName: 'inventory_movement' })
export class InventoryMovementOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  tenantId!: string;

  @Property()
  productId!: string;

  @ManyToOne(() => WarehouseOrmEntity)
  warehouse!: WarehouseOrmEntity;

  @ManyToOne(() => LocationOrmEntity, { nullable: true })
  location?: LocationOrmEntity;

  @Enum({ items: () => InventoryMovementType })
  type!: InventoryMovementType;

  @Property({ type: 'decimal', precision: 14, scale: 4 })
  quantity!: string;

  @Property()
  reference!: string;

  @Property()
  date: Date = new Date();

  @Property()
  createdAt: Date = new Date();

  @Property({ nullable: true })
  lotId?: string;

  @Property({ nullable: true })
  serialNumber?: string;
}
