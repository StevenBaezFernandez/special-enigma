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

export class Subscription {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

    tenantId!: string;

  @ManyToOne(() => SubscriptionPlan)
  plan!: SubscriptionPlan;

  @Enum(() => SubscriptionStatus)
  status: SubscriptionStatus = SubscriptionStatus.ACTIVE;

    externalSubscriptionId?: string;

    externalCustomerId?: string;

    currentPeriodEnd?: Date;

    cancelAtPeriodEnd = false;

    startDate: Date = new Date();

    endDate?: Date;

    createdAt: Date = new Date();

    updatedAt: Date = new Date();

  constructor(tenantId: string, plan: SubscriptionPlan, status: SubscriptionStatus = SubscriptionStatus.ACTIVE) {
    this.tenantId = tenantId;
    this.plan = plan;
    this.status = status;
  }

  isValid(): boolean {
    const now = new Date();
    if (this.status !== SubscriptionStatus.ACTIVE && this.status !== SubscriptionStatus.TRIAL) {
      return false;
    }
    if (this.currentPeriodEnd && this.currentPeriodEnd < now) {
      return false;
    }
    if (this.endDate && !this.currentPeriodEnd && this.endDate < now) {
      return false;
    }
    return true;
  }

  markAsActive(externalSubId: string, currentPeriodEnd: Date) {
    this.status = SubscriptionStatus.ACTIVE;
    this.externalSubscriptionId = externalSubId;
    this.currentPeriodEnd = currentPeriodEnd;
    this.endDate = currentPeriodEnd;
  }

  markAsCanceled(atPeriodEnd: boolean) {
    this.cancelAtPeriodEnd = atPeriodEnd;
    if (!atPeriodEnd) {
      this.status = SubscriptionStatus.CANCELED;
      this.endDate = new Date();
    }
  }
}
