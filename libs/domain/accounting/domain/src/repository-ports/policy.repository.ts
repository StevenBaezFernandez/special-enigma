export interface PolicyRepository {
  getPolicy(tenantId: string, type: string): Promise<unknown>;
}

export const POLICY_REPOSITORY = 'POLICY_REPOSITORY';
