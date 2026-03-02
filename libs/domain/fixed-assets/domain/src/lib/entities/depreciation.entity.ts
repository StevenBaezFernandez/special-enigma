import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { v4 } from 'uuid';

export class Depreciation {
  readonly id: string;
  readonly tenantId: string;
  readonly assetId: string;
  readonly date: Date;
  readonly amount: number;
  readonly accumulatedDepreciation: number;
  readonly createdAt: Date;

  constructor(params: {
  @Property()
    tenantId: string;
    assetId: string;
    date: Date;
  @Property()
    amount: number;
    accumulatedDepreciation: number;
    id?: string;
  @Property()
    createdAt?: Date;
  }) {
    this.id = params.id ?? v4();
    this.tenantId = params.tenantId;
    this.assetId = params.assetId;
    this.date = params.date;
    this.amount = params.amount;
    this.accumulatedDepreciation = params.accumulatedDepreciation;
    this.createdAt = params.createdAt ?? new Date();
  }
}
