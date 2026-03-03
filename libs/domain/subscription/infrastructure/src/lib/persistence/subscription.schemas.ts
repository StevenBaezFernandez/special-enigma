import { EntitySchema, Cascade } from '@mikro-orm/core';
import { Subscription, SubscriptionPlan } from '@virteex/domain-subscription-domain';

export const SubscriptionPlanSchema = new EntitySchema<SubscriptionPlan>({
  class: SubscriptionPlan,
  properties: {
    id: { primary: true, type: 'uuid' },
    name: { type: 'string' },
    code: { type: 'string' },
    price: { type: 'string' },
    features: { type: 'json' },
  },
});

export const SubscriptionSchema = new EntitySchema<Subscription>({
  class: Subscription,
  properties: {
    id: { primary: true, type: 'uuid' },
    tenantId: { type: 'string' },
    plan: { kind: 'm:1', entity: 'SubscriptionPlan' },
    status: { type: 'string' },
    startDate: { type: 'Date' },
    endDate: { type: 'Date', nullable: true },
    cancelAtPeriodEnd: { type: 'boolean', default: false },
  },
});
