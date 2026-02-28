import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Sale, SaleItem, SaleRepository, SaleStatus, CustomerRepository, InventoryService, CatalogService } from '../../../../domain/src';
import { StockReservationItem } from '../../../../domain/src/lib/ports/inventory.service';
import { CreateSaleDto } from '../dtos/create-sale.dto';
import Decimal from 'decimal.js';

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
  ) {}

  async execute(dto: CreateSaleDto): Promise<Sale> {
    const customer = await this.customerRepository.findById(dto.customerId);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${dto.customerId} not found`);
    }

    let warehouse;
    if (dto.warehouseId) {
        warehouse = await this.inventoryService.getWarehouse(dto.warehouseId);
        if (!warehouse) {
            throw new NotFoundException(`Warehouse with ID ${dto.warehouseId} not found`);
        }
        if (warehouse.tenantId !== dto.tenantId) {
            throw new BadRequestException(`Warehouse ${dto.warehouseId} does not belong to tenant`);
        }
    } else {
        const warehouses = await this.inventoryService.getWarehouses(dto.tenantId);
        if (warehouses.length === 0) {
           throw new BadRequestException('No warehouse found for this tenant to fulfill the sale.');
        }
        warehouse = warehouses[0];
    }

    let total = new Decimal(0);
    const sale = new Sale(dto.tenantId, dto.customerId, customer.companyName || `${customer.firstName} ${customer.lastName}`, '0');

    const reservationItems: StockReservationItem[] = [];

    for (const item of dto.items) {
      const prodId = parseInt(item.productId, 10);
      if (isNaN(prodId)) {
           throw new BadRequestException(`Invalid product ID: ${item.productId}`);
      }
      const product = await this.catalogService.getProductById(prodId);
      if (!product) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }

      const price = new Decimal(product.price);
      const quantity = new Decimal(item.quantity);

      const hasStock = await this.inventoryService.checkStock(warehouse.id, product.sku, item.quantity);
      if (!hasStock) {
        throw new BadRequestException(`Insufficient stock for product ${product.name} (SKU: ${product.sku}) in warehouse ${warehouse.name}`);
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
      sale.items.add(saleItem);
    }

    sale.total = total.toString();
    // 1. Set Initial Status to DRAFT (Pending)
    sale.status = SaleStatus.DRAFT;

    // 2. Persist Sale First
    // This ensures we have a record before we try to affect external systems (Inventory)
    await this.saleRepository.create(sale);

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
    } catch (error: any) {
        this.logger.error(`Stock reservation failed for sale ${sale.id}: ${error.message}`);

        // Compensating action: Cancel the sale
        sale.status = SaleStatus.CANCELLED;
        // Best effort to save the cancellation state
        try {
            await this.saleRepository.create(sale);
        } catch (e: any) {
            this.logger.error(`Failed to cancel sale ${sale.id} after reservation failure: ${e.message}`);
            // Critical: We have a zombie state (Draft but failed).
            // Alerting/Monitoring would pick this up via logs.
        }

        throw error; // Re-throw to propagate error to client
    }

    return sale;
  }
}
