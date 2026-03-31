
import { v4 } from 'uuid';
import { PlanLimit } from '@virteex/domain-subscription-contracts';

export class SubscriptionPlan {
    id: string = v4();

    slug!: string;

    name!: string;

    price!: string;

    stripePriceId?: string;

    monthlyPriceId!: string;

    annualPriceId!: string;

    description!: string;

    features: string[] = [];

    limits: PlanLimit[] = [];

    isActive = true;

    createdAt: Date = new Date();

    updatedAt: Date = new Date();

  constructor(
    slug: string,
    name: string,
    price: string,
    description: string,
    features: string[],
    monthlyPriceId: string,
    annualPriceId: string,
    limits?: PlanLimit[]
  ) {
    this.slug = slug;
    this.name = name;
    this.price = price;
    this.description = description;
    this.features = features;
    this.monthlyPriceId = monthlyPriceId;
    this.annualPriceId = annualPriceId;
    if (limits) {
      this.limits = limits;
    }
  }
}
