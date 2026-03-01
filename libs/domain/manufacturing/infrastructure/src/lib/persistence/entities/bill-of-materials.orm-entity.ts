import { Entity, PrimaryKey, Property, OneToMany, Collection, Cascade } from '@mikro-orm/core';

@Entity({ schema: 'manufacturing', tableName: 'bill_of_materials' })
export class BillOfMaterialsOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  productSku!: string;

  @Property()
  version!: string;

  @Property({ default: true })
  isActive = true;

  @OneToMany(() => BillOfMaterialsComponentOrmEntity, 'billOfMaterials', { cascade: [Cascade.ALL] })
  components = new Collection<BillOfMaterialsComponentOrmEntity>(this);

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

@Entity({ schema: 'manufacturing', tableName: 'bill_of_materials_component' })
export class BillOfMaterialsComponentOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  tenantId!: string;

  @Property()
  componentProductSku!: string;

  @Property({ type: 'decimal', precision: 10, scale: 4 })
  quantity!: number;

  @Property()
  unit!: string;

  @Property()
  billOfMaterials!: BillOfMaterialsOrmEntity;
}
