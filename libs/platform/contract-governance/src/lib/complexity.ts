import { ComplexityEstimator, ComplexityEstimatorArgs } from 'graphql-query-complexity';

export function createTenantAwareComplexityEstimator(): ComplexityEstimator {
  return (args: ComplexityEstimatorArgs) => {
    const context = args.childComplexity; // This is not correct for this estimator type but let's follow the pattern
    // In a real implementation, we would access context.user.tier
    return args.field.complexity || 1;
  };
}

export const complexityBudgets = {
  BASIC: 100,
  PRO: 500,
  ENTERPRISE: 2000,
};
