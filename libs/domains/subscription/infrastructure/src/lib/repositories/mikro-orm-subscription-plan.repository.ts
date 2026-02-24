import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { SubscriptionPlan, SubscriptionPlanRepository } from '@virteex/domain-subscription-domain';

@Injectable()
export class MikroOrmSubscriptionPlanRepository implements SubscriptionPlanRepository {
  constructor(private readonly em: EntityManager) {}

  async findAll(): Promise<SubscriptionPlan[]> {
    return this.em.find(SubscriptionPlan, {});
  }

  async findById(id: string): Promise<SubscriptionPlan | null> {
    return this.em.findOne(SubscriptionPlan, { id });
  }

  async findBySlug(slug: string): Promise<SubscriptionPlan | null> {
    return this.em.findOne(SubscriptionPlan, { slug });
  }
}
