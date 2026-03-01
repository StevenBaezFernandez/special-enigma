import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { UserOrmEntity } from './user.orm-entity';
import { v4 as uuidv4 } from 'uuid';

@Entity({ schema: 'identity', tableName: 'company' })
export class CompanyOrmEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property()
  name!: string;

  @Property()
  taxId!: string;

  @Property()
  country!: string;

  @Property({ nullable: true })
  regime?: string;

  @Property({ nullable: true })
  postalCode?: string;

  @Property()
  currency = 'USD';

  @Property({ type: 'json', nullable: true })
  settings?: Record<string, any>;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @OneToMany(() => UserOrmEntity, user => user.company)
  users = new Collection<UserOrmEntity>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
