import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'sat_catalog_payment_forms' })
export class SatPaymentForm {
  @PrimaryKey()
  code!: string;

  @Property()
  name!: string;
}

@Entity({ tableName: 'sat_catalog_payment_methods' })
export class SatPaymentMethod {
  @PrimaryKey()
  code!: string;

  @Property()
  name!: string;
}

@Entity({ tableName: 'sat_catalog_usages' })
export class SatCfdiUsage {
  @PrimaryKey()
  code!: string;

  @Property()
  name!: string;
}
