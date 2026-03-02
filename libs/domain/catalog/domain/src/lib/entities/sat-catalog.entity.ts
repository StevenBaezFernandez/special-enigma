import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
export class SatPaymentForm {
  @Property()
  code!: string;

  @Property()
  name!: string;
}

export class SatPaymentMethod {
  @Property()
  code!: string;

  @Property()
  name!: string;
}

export class SatCfdiUsage {
  @Property()
  code!: string;

  @Property()
  name!: string;
}
