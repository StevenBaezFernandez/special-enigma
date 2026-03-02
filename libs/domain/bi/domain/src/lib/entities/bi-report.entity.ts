import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";

@Entity()
export class BiReport {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
    name!: string;

    type!: string;

    data!: any;

    generatedAt!: Date;

  constructor(name: string, type: string, data: any) {
    this.name = name;
    this.type = type;
    this.data = data;
    this.generatedAt = new Date();
  }
}
