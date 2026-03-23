export interface PolicyRepository {
  getPolicy(tenantId: string, type: string): Promise<any>;
}

export const POLICY_REPOSITORY = 'POLICY_REPOSITORY';
