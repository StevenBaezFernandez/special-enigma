import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import type { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity({ schema: 'identity' })
export class Company {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property()
  name!: string;

  @Property()
  taxId!: string; // NIT, RFC, etc.

  @Property()
  country!: string;

  // New fields for Tax/Regime Context
  @Property({ nullable: true })
  regime?: string; // Simplified, Ordinary, Gran Contribuyente

  @Property({ nullable: true })
  postalCode?: string;

  @Property()
  currency = 'USD'; // Default, adaptive based on country

  @Property({ type: 'json', nullable: true })
  settings?: Record<string, any>; // For tax configurations

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @OneToMany('User', 'company')
  users = new Collection<User>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(name: string, taxId: string, country: string) {
    this.name = name;
    this.taxId = taxId;
    this.country = country;
    this.currency = this.getDefaultCurrency(country);
  }

  private getDefaultCurrency(country: string): string {
      switch(country) {
          case 'CO': return 'COP';
          case 'MX': return 'MXN';
          case 'BR': return 'BRL';
          case 'US': return 'USD';
          default: return 'USD';
      }
  }
}
