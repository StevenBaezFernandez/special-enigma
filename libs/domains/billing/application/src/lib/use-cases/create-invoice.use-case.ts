import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClientKafka } from '@nestjs/microservices';
import {
  Invoice,
  InvoiceItem,
  InvoiceRepository,
  INVOICE_REPOSITORY,
  FiscalStampingService,
  InvoiceStampedEvent,
  ProductRepository,
  PRODUCT_REPOSITORY,
  TaxCalculatorService,
  TENANT_CONFIG_REPOSITORY,
  TenantConfigRepository
} from '@virteex/domain-billing-domain';
import { DomainException } from '@virteex/shared-util-server-config';
import { CreateInvoiceDto } from '../dtos/create-invoice.dto';
import { Decimal } from 'decimal.js';

@Injectable()
export class CreateInvoiceUseCase {
  private readonly logger = new Logger(CreateInvoiceUseCase.name);

  constructor(
    @Inject(INVOICE_REPOSITORY) private readonly invoiceRepository: InvoiceRepository,
    @Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository,
    @Inject(TENANT_CONFIG_REPOSITORY) private readonly tenantConfigRepository: TenantConfigRepository,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    private readonly fiscalStampingService: FiscalStampingService,
    private readonly taxCalculatorService: TaxCalculatorService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(dto: CreateInvoiceDto): Promise<Invoice> {
    if (!dto.tenantId) {
        throw new DomainException('Tenant ID is required', 'TENANT_REQUIRED');
    }
    let subtotal = new Decimal(0);
    let totalTax = new Decimal(0);

    const tenantConfig = await this.tenantConfigRepository.getFiscalConfig(dto.tenantId);
    const jurisdiction = tenantConfig.country || 'MX';

    const invoice = new Invoice(dto.tenantId, dto.customerId, '0', '0');
    invoice.dueDate = new Date(dto.dueDate);
    invoice.paymentForm = dto.paymentForm;
    invoice.paymentMethod = dto.paymentMethod;
    invoice.usage = dto.usage;

    // Backend Calculation
    for (const itemDto of dto.items) {
        let price = new Decimal(itemDto.unitPrice);
        const qty = new Decimal(itemDto.quantity);

        // Security: Validate price against Catalog if productId is present
        if (itemDto.productId) {
            const product = await this.productRepository.findById(itemDto.productId);
            if (product) {
                const catalogPrice = new Decimal(product.price);
                // Compare with small tolerance or strict equality
                if (!price.equals(catalogPrice)) {
                    this.logger.warn(`Price mismatch for product ${itemDto.productId}. Provided: ${price}, Catalog: ${catalogPrice}. Using catalog price.`);
                    price = catalogPrice;
                }
            } else {
                 throw new DomainException(`Product with ID ${itemDto.productId} not found`, 'PRODUCT_NOT_FOUND');
            }
        }

        const amount = qty.times(price);

        // Dynamic Tax Calculation using Strategy
        const taxResult = await this.taxCalculatorService.calculateTax(amount.toNumber(), jurisdiction);
        const tax = new Decimal(taxResult.totalTax);

        subtotal = subtotal.plus(amount);
        totalTax = totalTax.plus(tax);

        const item = new InvoiceItem(
            invoice,
            itemDto.description,
            itemDto.quantity,
            price.toFixed(2),
            amount.toFixed(2),
            tax.toFixed(2)
        );
        if (itemDto.productId) {
            item.productId = itemDto.productId;
        }
        invoice.items.add(item);
    }

    const totalAmount = subtotal.plus(totalTax);

    invoice.totalAmount = totalAmount.toFixed(2);
    invoice.taxAmount = totalTax.toFixed(2);
    invoice.status = 'PENDING';

    // 1. Save Pending (before external call)
    invoice.status = 'PENDING_STAMP';
    await this.invoiceRepository.save(invoice);

    try {
      this.logger.log(`Stamping invoice for customer ${dto.customerId}`);

      // 2. External Call (Stamping)
      // Note: This operation is idempotent in PAC provider (ideally)
      const stamp = await this.fiscalStampingService.stampInvoice(invoice);

      invoice.fiscalUuid = stamp.uuid;
      invoice.xmlContent = stamp.xml;
      invoice.stampedAt = new Date(stamp.fechaTimbrado);
      invoice.status = 'STAMPED';

      this.logger.log(`Invoice stamped. UUID: ${stamp.uuid}`);

      this.eventEmitter.emit(
        'invoice.stamped',
        new InvoiceStampedEvent(
            invoice.id,
            invoice.tenantId,
            Number(invoice.totalAmount),
            Number(invoice.taxAmount),
            new Date()
        )
      );

      this.kafkaClient.emit('billing.invoice.validated', {
          id: invoice.id,
          tenantId: invoice.tenantId,
          totalAmount: invoice.totalAmount,
          taxAmount: invoice.taxAmount,
          stampedAt: invoice.stampedAt
      });

      // 3. Save Stamped (Update)
      await this.invoiceRepository.save(invoice);

    } catch (error: any) {
      this.logger.error(`Failed to stamp invoice: ${error}`);
      // Record remains PENDING
      throw error;
    }

    return invoice;
  }
}
