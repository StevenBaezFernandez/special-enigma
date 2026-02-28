import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class JobTitle {
  @PrimaryKey()
  id: string = uuidv4();

  @Property()
  title!: string;

  constructor(title: string) {
    this.title = title;
  }
}
