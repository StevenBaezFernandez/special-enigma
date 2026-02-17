import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class BiReport {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  name!: string;

  @Property()
  type!: string;

  @Property({ type: 'json' })
  data!: any;

  @Property()
  generatedAt!: Date;

  constructor(name: string, type: string, data: any) {
    this.name = name;
    this.type = type;
    this.data = data;
    this.generatedAt = new Date();
  }
}
