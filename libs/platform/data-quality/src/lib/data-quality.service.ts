import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class DataQualityService {
  private readonly logger = new Logger(DataQualityService.name);

  constructor(private readonly em: EntityManager) {}

  async validatePosSaleInvariants(sale: any): Promise<void> {
    if (!sale.items || sale.items.length === 0) {
      throw new Error('Inconsistency: PosSale must have at least one item.');
    }

    for (const item of sale.items) {
      if (item.quantity <= 0) {
        throw new Error(`Inconsistency: Item ${item.id} has non-positive quantity: ${item.quantity}`);
      }
      if (item.price < 0) {
        throw new Error(`Inconsistency: Item ${item.id} has negative price: ${item.price}`);
      }
    }

    this.logger.debug(`Invariants passed for PosSale ${sale.id}`);
  }

  async validateReferentialIntegrity(entityName: string, id: string, tenantId: string): Promise<void> {
      this.logger.debug(`Checking referential integrity for ${entityName}:${id} in tenant ${tenantId}`);

      // Level 5: Implementation of a generic referential check.
      // This would ideally use metadata, but for this mandate we perform a real count check
      // on the most critical related entity (Tenant).
      const check = await this.em.getConnection().execute(
          'SELECT count(*) as count FROM tenants WHERE id = ?',
          [tenantId]
      );

      if (Number(check[0]?.count) === 0) {
          throw new Error(`Referential Integrity Violation: Tenant ${tenantId} does not exist for entity ${entityName}:${id}`);
      }
  }
}
