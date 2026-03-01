import { Entity, PrimaryKey, Property, OneToMany, Collection, Cascade, ManyToOne } from '@mikro-orm/core';
import { v4 } from 'uuid';

@Entity({ schema: 'manufacturing', tableName: 'production_order' })
export class ProductionOrderOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  tenantId!: string;

  @Property()
  productSku!: string;

  @Property()
  warehouseId!: string;

  @Property()
  quantity!: number;

  @Property()
  status!: string;

  @Property()
  dueDate!: Date;

  @OneToMany(() => ProductionOrderComponentOrmEntity, 'productionOrder', { cascade: [Cascade.ALL] })
  components = new Collection<ProductionOrderComponentOrmEntity>(this);
}

@Entity({ schema: 'manufacturing', tableName: 'production_order_component' })
export class ProductionOrderComponentOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  tenantId!: string;

  @ManyToOne(() => ProductionOrderOrmEntity)
  productionOrder!: ProductionOrderOrmEntity;

  @Property()
  componentProductSku!: string;

  @Property({ type: 'decimal', precision: 10, scale: 4 })
  requiredQuantity!: number;

  @Property({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  reservedQuantity = 0;

  @Property({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  consumedQuantity = 0;
}
