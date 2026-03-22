
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

  private id: string = v4();

  private tenantId: string;

  private plan: SubscriptionPlan;

  private status: SubscriptionStatus = SubscriptionStatus.ACTIVE;

  private externalSubscriptionId?: string;

  private externalCustomerId?: string;

  private currentPeriodEnd?: Date;

  private cancelAtPeriodEnd = false;

  private startDate: Date = new Date();

  private endDate?: Date;

  private createdAt: Date = new Date();

  private updatedAt: Date = new Date();

  constructor(tenantId: string, plan: SubscriptionPlan, status: SubscriptionStatus = SubscriptionStatus.ACTIVE) {
    this.tenantId = tenantId;
    this.plan = plan;
    this.status = status;
  }

  getId(): string { return this.id; }
  getTenantId(): string { return this.tenantId; }
  getPlan(): SubscriptionPlan { return this.plan; }
  getStatus(): SubscriptionStatus { return this.status; }
  getExternalSubscriptionId(): string | undefined { return this.externalSubscriptionId; }
  getExternalCustomerId(): string | undefined { return this.externalCustomerId; }
  getCurrentPeriodEnd(): Date | undefined { return this.currentPeriodEnd; }
  isCancelAtPeriodEnd(): boolean { return this.cancelAtPeriodEnd; }
  getStartDate(): Date { return this.startDate; }
  getEndDate(): Date | undefined { return this.endDate; }

  setExternalCustomerId(externalCustomerId: string) {
    this.externalCustomerId = externalCustomerId;
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
    this.updatedAt = new Date();
  }

  markAsCanceled(atPeriodEnd: boolean) {
    this.cancelAtPeriodEnd = atPeriodEnd;
    if (!atPeriodEnd) {
      this.status = SubscriptionStatus.CANCELED;
      this.endDate = new Date();
    }
    this.updatedAt = new Date();
  }

  changePlan(newPlan: SubscriptionPlan) {
    this.plan = newPlan;
    this.updatedAt = new Date();
  }
}
