import { ComplexityEstimator, ComplexityEstimatorArgs } from 'graphql-query-complexity';

export const complexityBudgets = {
  BASIC: 100,
  PRO: 500,
  ENTERPRISE: 2000,
};

export function createTenantAwareComplexityEstimator(): ComplexityEstimator {
  return (args: ComplexityEstimatorArgs) => {
    // Standard estimation logic
    const baseComplexity = (args.field as any).complexity || 1;
    const multipliers = args.childComplexity || 1;

    // In a real implementation, we could also inject tenant-specific multipliers
    // based on the data volume of the specific tenant if available in args.

    return baseComplexity * multipliers;
  };
}

export function getTenantBudget(tier: string = 'BASIC'): number {
  return (complexityBudgets as any)[tier] || complexityBudgets.BASIC;
}
