import { PlanLimit } from '@virteex/domain-subscription-contracts';

export interface StructuredLimits {
  invoices: number;
  users: number;
  storage: number;
  [key: string]: number;
}

export class PlanLimitMapper {
  static toStructuredLimits(limits: PlanLimit[]): StructuredLimits {
    const structured: StructuredLimits = {
      invoices: 0,
      users: 0,
      storage: 0
    };

    limits.forEach(limit => {
      structured[limit.resource] = limit.limit;
    });

    return structured;
  }
}
