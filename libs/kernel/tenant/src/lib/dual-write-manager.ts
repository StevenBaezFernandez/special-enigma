import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class DualWriteManager {
  private readonly logger = new Logger(DualWriteManager.name);

  constructor(private readonly em: EntityManager) {}

  /**
   * Level 5: Facilitates Expand-Contract migrations.
   * Ensures that data is written to both old and new schemas during transition.
   * NOTE: This is strictly for schema-level migrations (Expand-Contract),
   * not for distributed state (which must use Transactional Outbox).
   */
  async executeDualWrite<T>(
    operation: () => Promise<T>,
    backfill: () => Promise<void>
  ): Promise<T> {
    return await this.em.transactional(async (txEm) => {
      const result = await operation();
      await backfill();
      return result;
    });
  }
}
