import { OutboxMessage, OutboxRepository } from './outbox.interfaces';

export class InMemoryOutboxRepository implements OutboxRepository {
  private messages: OutboxMessage[] = [];

  async save(message: OutboxMessage): Promise<void> {
    this.messages.push(message);
  }

  async findUnprocessed(limit: number): Promise<OutboxMessage[]> {
    return this.messages
      .filter((m) => !m.processedAt)
      .slice(0, limit);
  }

  async markAsProcessed(id: string): Promise<void> {
    const message = this.messages.find((m) => m.id === id);
    if (message) {
      message.processedAt = new Date();
    }
  }
}
