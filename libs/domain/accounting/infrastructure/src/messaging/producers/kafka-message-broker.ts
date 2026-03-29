import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { IMessageBroker } from '@virteex/domain-accounting-application';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaMessageBroker implements IMessageBroker, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaMessageBroker.name);
  private kafkaProducer: Producer | null = null;

  async onModuleInit() {
    const brokers = process.env['KAFKA_BROKERS'] ? process.env['KAFKA_BROKERS'].split(',') : [];
    if (brokers.length > 0) {
      try {
        const kafka = new Kafka({
          clientId: process.env['KAFKA_CLIENT_ID'] || 'accounting-service',
          brokers: brokers,
        });
        this.kafkaProducer = kafka.producer();
        await this.kafkaProducer.connect();
        this.logger.log('Connected to Kafka successfully.');
      } catch (err) {
        this.logger.error('Failed to connect to Kafka', err);
      }
    } else {
      this.logger.warn('KAFKA_BROKERS not set. Kafka disabled.');
    }
  }

  async onModuleDestroy() {
    if (this.kafkaProducer) {
      await this.kafkaProducer.disconnect();
    }
  }

  async publish(topic: string, payload: unknown): Promise<void> {
    if (!this.kafkaProducer) {
      this.logger.warn(`Kafka producer not available. Dropping message for topic: ${topic}`);
      return;
    }

    try {
      await this.kafkaProducer.send({
        topic: topic.replace(/\./g, '-'),
        messages: [{ value: JSON.stringify(payload) }],
      });
    } catch (err) {
      this.logger.error(`Failed to publish message to Kafka topic ${topic}`, err);
      throw err;
    }
  }
}
