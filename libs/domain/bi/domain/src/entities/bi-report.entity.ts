import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity({ schema: 'bi' })
export class BiReport {
  @PrimaryKey()
  readonly id: string;

  @Property()
  readonly tenantId: string;

  @Property()
  readonly name: string;

  @Property()
  readonly type: string;

  @Property({ type: 'json' })
  readonly data  : any;

  @Property()
  readonly createdAt: Date;

  constructor(
    tenantId: string,
    name: string,
    type: string,
    data  : any,
    id?: string,
    createdAt?: Date
  ) {
    this.tenantId = tenantId;
    this.name = name;
    this.type = type;
    this.data = data;
    this.id = id || uuidv4();
    this.createdAt = createdAt || new Date();
  }
}
