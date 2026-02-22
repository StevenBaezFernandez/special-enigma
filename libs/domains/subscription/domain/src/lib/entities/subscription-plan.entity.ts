import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

export interface PlanLimits {
  invoices: number; // -1 for unlimited
  users: number;
  storage: number; // in MB
}

@Entity()
export class SubscriptionPlan {
  @PrimaryKey()
  id: string = v4();

  @Property()
  slug!: string;

  @Property()
  name!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;

  @Property()
  description!: string;

  @Property({ type: 'json' })
  features: string[] = [];

  @Property({ type: 'json' })
  limits: PlanLimits = { invoices: 100, users: 1, storage: 100 }; // Default limits

  @Property()
  isActive = true;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(slug: string, name: string, price: string, description: string, features: string[], limits?: PlanLimits) {
    this.slug = slug;
    this.name = name;
    this.price = price;
    this.description = description;
    this.features = features;
    if (limits) {
      this.limits = limits;
    }
  }
}
