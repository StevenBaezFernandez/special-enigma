import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  OutboxMessage,
  OutboxRepository,
} from '@virteex/domain-accounting-domain';

@Injectable()
export class MikroOrmOutboxRepository implements OutboxRepository {
  constructor(private readonly em: EntityManager) {}

  async save(message: OutboxMessage): Promise<void> {
    const em = this.em.fork();
    const outboxMessage = em.create('OutboxMessage', message);
    await em.persistAndFlush(outboxMessage);
  }

  async findUnprocessed(limit: number): Promise<OutboxMessage[]> {
    const em = this.em.fork();
    return em.find<OutboxMessage>(
      'OutboxMessage',
      { processedAt: null },
      { limit, orderBy: { createdAt: 'ASC' } },
    );
  }

  async markAsProcessed(id: string): Promise<void> {
    const em = this.em.fork();
    const message = await em.findOne<OutboxMessage>('OutboxMessage', { id });
    if (message) {
      message.processedAt = new Date();
      await em.flush();
    }
  }
}
