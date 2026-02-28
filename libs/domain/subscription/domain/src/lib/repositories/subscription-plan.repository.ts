import { SubscriptionPlan } from '../entities/subscription-plan.entity';

export const SUBSCRIPTION_PLAN_REPOSITORY = 'SUBSCRIPTION_PLAN_REPOSITORY';

export interface SubscriptionPlanRepository {
  findAll(): Promise<SubscriptionPlan[]>;
  findById(id: string): Promise<SubscriptionPlan | null>;
  findBySlug(slug: string): Promise<SubscriptionPlan | null>;
}
