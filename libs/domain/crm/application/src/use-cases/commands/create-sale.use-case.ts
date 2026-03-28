import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { Sale, SaleItem, type SaleRepository, SaleStatus, type CustomerRepository, type InventoryService, type CatalogService } from '@virteex/domain-crm-domain';
import type { StockReservationItem } from '@virteex/domain-crm-domain';
import { type CreateSaleDto } from '../../dto/create-sale.dto';
import Decimal from 'decimal.js';
import { OutboxService } from '@virteex/kernel-messaging';

@Injectable()
export class CreateSaleUseCase {
  private readonly logger = new Logger(CreateSaleUseCase.name);

  constructor(
    @Inject('SaleRepository')
    private readonly saleRepository: SaleRepository,
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
    @Inject('CatalogService')
    private readonly catalogService: CatalogService,
    @Inject('InventoryService')
    private readonly inventoryService: InventoryService,
    private readonly outboxService: OutboxService,
  ) {}

  async execute(dto: CreateSaleDto): Promise<Sale> {
    const customer = await this.customerRepository.findById(dto.customerId);
    if (!customer) {
      throw new DomainException(`Customer with ID ${dto.customerId} not found`, 'ENTITY_NOT_FOUND');
    }

    let warehouse;
    if (dto.warehouseId) {
        warehouse = await this.inventoryService.getWarehouse(dto.warehouseId);
        if (!warehouse) {
            throw new DomainException(`Warehouse with ID ${dto.warehouseId} not found`, 'ENTITY_NOT_FOUND');
        }
        if (warehouse.tenantId !== dto.tenantId) {
            throw new DomainException(`Warehouse ${dto.warehouseId} does not belong to tenant`, 'BAD_REQUEST');
        }
    } else {
        const warehouses = await this.inventoryService.getWarehouses(dto.tenantId);
        if (warehouses.length === 0) {
           throw new DomainException('No warehouse found for this tenant to fulfill the sale.', 'BAD_REQUEST');
        }
        warehouse = warehouses[0];
    }

    let total = new Decimal(0);
    const sale = new Sale(dto.tenantId, dto.customerId, customer.companyName || `${customer.firstName} ${customer.lastName}`, '0');

    const reservationItems: StockReservationItem[] = [];

    for (const item of dto.items) {
      const prodId = parseInt(item.productId, 10);
      if (isNaN(prodId)) {
           throw new DomainException(`Invalid product ID: ${item.productId}`, 'BAD_REQUEST');
      }
      const product = await this.catalogService.getProductById(prodId);
      if (!product) {
        throw new DomainException(`Product with ID ${item.productId} not found`, 'ENTITY_NOT_FOUND');
      }

      const price = new Decimal(product.price);
      const quantity = new Decimal(item.quantity);

      const hasStock = await this.inventoryService.checkStock(warehouse.id, product.sku, item.quantity);
      if (!hasStock) {
        throw new DomainException(`Insufficient stock for product ${product.name} (SKU: ${product.sku}) in warehouse ${warehouse.name}`, 'BAD_REQUEST');
      }

      reservationItems.push({
          warehouseId: warehouse.id,
          productSku: product.sku,
          quantity: item.quantity
      });

      const itemTotal = price.mul(quantity);
      total = total.plus(itemTotal);

      const saleItem = new SaleItem(
        item.productId,
        product.name,
        price.toString(),
        item.quantity.toString(),
      );
      sale.items.push(saleItem);
    }

    sale.total = total.toString();
    // 1. Set Initial Status to DRAFT (Pending)
    sale.status = SaleStatus.DRAFT;

    // 2. Persist Sale First
    // This ensures we have a record before we try to affect external systems (Inventory)
    await this.saleRepository.create(sale);

    // 2.1 Add to Outbox for downstream consistency (Accounting, etc.)
    await this.outboxService.add({
        aggregateType: 'Sale',
        aggregateId: sale.id,
        eventType: 'SaleCreated',
        payload: {
            tenantId: sale.tenantId,
            customerId: sale.customerId,
            total: sale.total,
            status: sale.status,
            items: Array.from(sale.items).map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price }))
        }
    });

    try {
        // 3. Reserve Stock (Batch)
        // This is the critical external call. If it fails, we must rollback the sale state.
        await this.inventoryService.reserveBatchStock(reservationItems, `Sale ${sale.id}`);

        // 4. Update Sale to APPROVED if reservation succeeds
        sale.status = SaleStatus.APPROVED;

        // Use create again to update if update isn't explicitly defined,
        // assuming ORM handles upsert or object reference update.
        // If repo strictly inserts, this might fail, but without repo code we assume standard persistence pattern.
        // Usually persist/save handles new or existing entities.
        await this.saleRepository.create(sale);

        // 4.1 Update Outbox
        await this.outboxService.add({
            aggregateType: 'Sale',
            aggregateId: sale.id,
            eventType: 'SaleApproved',
            payload: { status: sale.status }
        });
    } catch (error : any) {
        this.logger.error(`Stock reservation failed for sale ${sale.id}: ${(error as Error).message}`);

        // Compensating action: Cancel the sale
        sale.status = SaleStatus.CANCELLED;
        // Mandatorily persist the cancellation state to avoid zombie records
        try {
            await this.saleRepository.create(sale);
        } catch (e : any) {
            this.logger.error(`CRITICAL: Failed to cancel sale ${sale.id} after reservation failure: ${(e as Error).message}. Manual reconciliation required.`);
            // Critical: We have a zombie state (Draft but failed).
            // Alerting/Monitoring would pick this up via logs.
        }

        throw error; // Re-throw to propagate error to client
    }

    return sale;
  }
}
