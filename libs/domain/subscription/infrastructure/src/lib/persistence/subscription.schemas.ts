import { EntitySchema } from '@mikro-orm/core';
import { Subscription, SubscriptionPlan } from '@virteex/domain-subscription-domain';

export const SubscriptionPlanSchema = new EntitySchema<SubscriptionPlan>({
  class: SubscriptionPlan,
  properties: {
    id: { primary: true, type: 'uuid' },
    slug: { type: 'string' },
    name: { type: 'string' },
    price: { type: 'string' },
    stripePriceId: { type: 'string', nullable: true },
    description: { type: 'string' },
    features: { type: 'json' },
    limits: { type: 'json' },
    isActive: { type: 'boolean', default: true },
    createdAt: { type: 'Date' },
    updatedAt: { type: 'Date', onUpdate: () => new Date() },
  },
});

export const SubscriptionSchema = new EntitySchema<Subscription>({
  class: Subscription,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    plan: { kind: 'm:1', entity: 'SubscriptionPlan' },
    status: { type: 'string' },
    externalSubscriptionId: { type: 'string', nullable: true },
    externalCustomerId: { type: 'string', nullable: true },
    currentPeriodEnd: { type: 'Date', nullable: true },
    startDate: { type: 'Date' },
    endDate: { type: 'Date', nullable: true },
    cancelAtPeriodEnd: { type: 'boolean', default: false },
    createdAt: { type: 'Date' },
    updatedAt: { type: 'Date', onUpdate: () => new Date() },
  },
});
