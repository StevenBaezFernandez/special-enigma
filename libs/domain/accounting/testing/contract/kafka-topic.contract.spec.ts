import { Test, TestingModule } from '@nestjs/testing';
import { KafkaMessageBroker } from '@virteex/domain-accounting-infrastructure';
import { Kafka } from 'kafkajs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockProducer = {
  connect: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn().mockResolvedValue(undefined),
  send: vi.fn().mockResolvedValue(undefined),
};

vi.mock('kafkajs', () => {
  return {
    Kafka: vi.fn().mockImplementation(function() {
      return {
        producer: () => mockProducer,
      };
    }),
  };
});

describe('KafkaTopicContract', () => {
  let broker: KafkaMessageBroker;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [KafkaMessageBroker],
    }).compile();

    broker = module.get<KafkaMessageBroker>(KafkaMessageBroker);

    process.env['KAFKA_BROKERS'] = 'localhost:9092';
    await broker.onModuleInit();
  });

  it('should publish to topic using canonical dot notation without replacing dots with dashes', async () => {
    const canonicalTopic = 'integration.v1.billing.invoice.stamped';
    const payload = { id: '123' };

    await broker.publish(canonicalTopic, payload);

    expect(mockProducer.send).toHaveBeenCalledWith({
      topic: canonicalTopic,
      messages: [{ value: JSON.stringify(payload) }],
    });
  });
});
