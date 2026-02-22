import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Subscription, SubscriptionRepository } from '@virteex/subscription-domain';

export class MikroOrmSubscriptionRepository implements SubscriptionRepository {
  constructor(
    @InjectRepository(Subscription)
    private readonly repository: EntityRepository<Subscription>
  ) {}

  async save(subscription: Subscription): Promise<void> {
    await this.repository.getEntityManager().persistAndFlush(subscription);
  }

  async findByTenantId(tenantId: string): Promise<Subscription | null> {
    // Return the most recent subscription, regardless of status.
    // The use case will handle filtering active/inactive.
    return this.repository.findOne({ tenantId }, { orderBy: { createdAt: 'DESC' } });
  }

  async findByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
    return this.repository.findOne({ stripeSubscriptionId });
  }
}
