import { Injectable } from '@nestjs/common';
import { type PolicyRepository } from '@virteex/domain-accounting-domain';

@Injectable()
export class StaticPolicyRepository implements PolicyRepository {
  async getPolicy(tenantId: string, type: string): Promise<any> {
    return null;
  }
}
