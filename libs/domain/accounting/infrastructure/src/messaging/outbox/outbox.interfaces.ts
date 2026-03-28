export interface OutboxMessage {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  payload: unknown;
  createdAt: Date;
  processedAt?: Date;
  tenantId: string;
}

export interface OutboxRepository {
  save(message: OutboxMessage): Promise<void>;
  findUnprocessed(limit: number): Promise<OutboxMessage[]>;
  markAsProcessed(id: string): Promise<void>;
}
