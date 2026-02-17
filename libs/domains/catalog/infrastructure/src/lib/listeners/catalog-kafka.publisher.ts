import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ClientKafka } from '@nestjs/microservices';
import { ProductCreatedEvent, ProductUpdatedEvent } from '@virteex/catalog-domain';

@Injectable()
export class CatalogKafkaPublisher {
  private readonly logger = new Logger(CatalogKafkaPublisher.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) {}

  @OnEvent('catalog.product.created')
  handleProductCreated(event: ProductCreatedEvent) {
    this.logger.log(`Publishing catalog.product.created for Product ${event.id}`);
    this.kafkaClient.emit('catalog.product.created', event);
  }

  @OnEvent('catalog.product.updated')
  handleProductUpdated(event: ProductUpdatedEvent) {
    this.logger.log(`Publishing catalog.product.updated for Product ${event.id}`);
    this.kafkaClient.emit('catalog.product.updated', event);
  }
}
