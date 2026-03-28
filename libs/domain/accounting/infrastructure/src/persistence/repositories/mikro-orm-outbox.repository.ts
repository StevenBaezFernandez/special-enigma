import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { OutboxMessage, OutboxRepository } from '../../messaging/outbox/outbox.interfaces';

@Injectable()
export class MikroOrmOutboxRepository implements OutboxRepository {
  constructor(private readonly em: EntityManager) {}

  async save(message: OutboxMessage): Promise<void> {
    const outboxMessage = this.em.create('OutboxMessage', message);
    await this.em.persistAndFlush(outboxMessage);
  }

  async findUnprocessed(limit: number): Promise<OutboxMessage[]> {
    return this.em.find<OutboxMessage>('OutboxMessage',
      { processedAt: null },
      { limit, orderBy: { createdAt: 'ASC' } }
    );
  }

  async markAsProcessed(id: string): Promise<void> {
    const message = await this.em.findOne<OutboxMessage>('OutboxMessage', { id });
    if (message) {
      message.processedAt = new Date();
      await this.em.flush();
    }
  }
}
