import { Entity, PrimaryKey, Property, ManyToOne, Unique, OneToMany, Collection, Cascade } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { WarehouseOrmEntity } from './warehouse.orm-entity';
import { LocationOrmEntity } from './location.orm-entity';

@Entity({ tableName: 'stock' })
@Unique({ properties: ['warehouse', 'location', 'productId'] })
export class StockOrmEntity {
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

  @Property({ type: 'decimal', precision: 14, scale: 4 })
  quantity = '0';

  @OneToMany(() => StockBatchOrmEntity, b => b.stock, { cascade: [Cascade.PERSIST, Cascade.REMOVE] })
  batches = new Collection<StockBatchOrmEntity>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

@Entity({ tableName: 'stock_batch' })
export class StockBatchOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => StockOrmEntity)
  stock!: StockOrmEntity;

  @Property({ type: 'decimal', precision: 14, scale: 4 })
  quantity = '0';

  @Property()
  entryDate: Date = new Date();

  @Property({ nullable: true })
  expirationDate?: Date;

  @Property({ type: 'decimal', precision: 14, scale: 4, nullable: true })
  cost?: string;
}
