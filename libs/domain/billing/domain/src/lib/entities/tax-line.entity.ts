import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";

export class TaxLine {
    id!: string;

    taxName!: string;

    rate!: string;

  @Property()
    amount!: string;

  constructor(taxName: string, rate: string, amount: string) {
    this.taxName = taxName;
    this.rate = rate;
    this.amount = amount;
  }
}
