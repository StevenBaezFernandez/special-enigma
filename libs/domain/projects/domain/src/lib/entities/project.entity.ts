import { Entity, PrimaryKey, Property, Collection } from '@mikro-orm/core';

@Entity()
export class Task {
  @PrimaryKey()
  id!: string;

  @Property()
  name!: string;
}

@Entity()
export class Project {
  @PrimaryKey()
  id!: string;

  @Property()
  name!: string;

  @Property({ type: 'Collection' })
  tasks = new Collection<Task>(this);
}
