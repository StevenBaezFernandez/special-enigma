import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EntityManager } from '@mikro-orm/core';
import { BillingProductEntity } from '../entities/billing-product.entity';
import { ProductCreatedEvent, ProductUpdatedEvent } from '@virteex/catalog-domain';

@Controller()
export class ProductEventsController {
  private readonly logger = new Logger(ProductEventsController.name);

  constructor(private readonly em: EntityManager) {}

  @EventPattern('catalog.product.created')
  async handleProductCreated(@Payload() data: ProductCreatedEvent) {
    this.logger.log(`Received catalog.product.created for Product ${data.id}`);

    const em = this.em.fork();

    const existing = await em.findOne(BillingProductEntity, { id: data.id.toString() });
    if (existing) {
        this.logger.warn(`Product ${data.id} already exists in billing replica. Updating instead.`);
        existing.name = data.name;
        existing.price = parseFloat(data.price);
        existing.isActive = data.isActive;
        existing.taxGroup = data.taxGroup;
        existing.fiscalCode = data.fiscalCode;
        await em.flush();
        return;
    }

    const product = new BillingProductEntity();
    product.id = data.id.toString();
    product.tenantId = data.tenantId;
    product.name = data.name;
    product.price = parseFloat(data.price);
    product.isActive = data.isActive;
    product.taxGroup = data.taxGroup;
    product.fiscalCode = data.fiscalCode;

    await em.persistAndFlush(product);
  }

  @EventPattern('catalog.product.updated')
  async handleProductUpdated(@Payload() data: ProductUpdatedEvent) {
    this.logger.log(`Received catalog.product.updated for Product ${data.id}`);
    const em = this.em.fork();

    let product = await em.findOne(BillingProductEntity, { id: data.id.toString() });
    if (!product) {
        this.logger.warn(`Product ${data.id} not found in billing replica. Creating it.`);
        product = new BillingProductEntity();
        product.id = data.id.toString();
        product.tenantId = data.tenantId;
        await em.persistAndFlush(product);
    }

    product.name = data.name;
    product.price = parseFloat(data.price);
    product.isActive = data.isActive;
    product.taxGroup = data.taxGroup;
    product.fiscalCode = data.fiscalCode;

    await em.flush();
  }
}
