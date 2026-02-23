import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { SubscriptionPlan } from './subscription-plan.entity';

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  TRIAL = 'TRIAL',
  PAST_DUE = 'PAST_DUE',
  PAYMENT_PENDING = 'PAYMENT_PENDING'
}

@Entity()
export class Subscription {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  tenantId!: string;

  @ManyToOne(() => SubscriptionPlan)
  plan!: SubscriptionPlan;

  @Enum(() => SubscriptionStatus)
  status: SubscriptionStatus = SubscriptionStatus.ACTIVE;

  @Property({ nullable: true })
  stripeSubscriptionId?: string;

  @Property({ nullable: true })
  stripeCustomerId?: string;

  @Property({ nullable: true })
  currentPeriodEnd?: Date;

  @Property({ type: 'boolean' })
  cancelAtPeriodEnd: boolean = false;

  @Property()
  startDate: Date = new Date();

  @Property({ nullable: true })
  endDate?: Date;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(tenantId: string, plan: SubscriptionPlan, status: SubscriptionStatus = SubscriptionStatus.ACTIVE) {
    this.tenantId = tenantId;
    this.plan = plan;
    this.status = status;
  }

  isValid(): boolean {
    const now = new Date();
    // Allow PAST_DUE for a grace period if needed, but strictly:
    if (this.status !== SubscriptionStatus.ACTIVE && this.status !== SubscriptionStatus.TRIAL) {
      return false;
    }
    // Check if subscription has ended (and not renewed)
    if (this.currentPeriodEnd && this.currentPeriodEnd < now) {
      // If Stripe says it ended, it ended.
      // But usually status reflects that.
      // Fallback to local endDate if currentPeriodEnd is not set.
      return false;
    }
    if (this.endDate && !this.currentPeriodEnd && this.endDate < now) {
      return false;
    }
    return true;
  }

  markAsActive(stripeSubId: string, currentPeriodEnd: Date) {
    this.status = SubscriptionStatus.ACTIVE;
    this.stripeSubscriptionId = stripeSubId;
    this.currentPeriodEnd = currentPeriodEnd;
    this.endDate = currentPeriodEnd; // Sync local endDate
  }

  markAsCanceled(atPeriodEnd: boolean) {
    this.cancelAtPeriodEnd = atPeriodEnd;
    if (!atPeriodEnd) {
      this.status = SubscriptionStatus.CANCELED;
      this.endDate = new Date();
    }
  }
}
