import { Entity, PrimaryKey, Property, Enum, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";
import { v4 as uuidv4 } from 'uuid';

export class JobTitle {
  id: string = uuidv4();
  title!: string;

  constructor(title: string) {
    this.title = title;
  }
}
