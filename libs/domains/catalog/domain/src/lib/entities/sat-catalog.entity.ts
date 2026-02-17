import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'sat_catalog_payment_forms', schema: 'catalog' })
export class SatPaymentForm {
  @PrimaryKey()
  code!: string;

  @Property()
  name!: string;
}

@Entity({ tableName: 'sat_catalog_payment_methods', schema: 'catalog' })
export class SatPaymentMethod {
  @PrimaryKey()
  code!: string;

  @Property()
  name!: string;
}

@Entity({ tableName: 'sat_catalog_usages', schema: 'catalog' })
export class SatCfdiUsage {
  @PrimaryKey()
  code!: string;

  @Property()
  name!: string;
}
