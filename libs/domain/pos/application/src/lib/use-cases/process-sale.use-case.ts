import { Inject, Injectable, Logger } from '@nestjs/common';
import { PosRepository, PosSale, PosSaleStatus, HARDWARE_BRIDGE_PORT, HardwareBridgePort } from '@virteex/domain-pos-domain';
import { ReserveBatchStockUseCase } from '@virteex/domain-inventory-application';
import { CreateInvoiceUseCase } from '@virteex/domain-billing-application';

@Injectable()
export class ProcessSaleUseCase {
  private readonly logger = new Logger(ProcessSaleUseCase.name);

  constructor(
    @Inject('PosRepository') private readonly posRepository: PosRepository,
    @Inject(HARDWARE_BRIDGE_PORT) private readonly hardwareBridge: HardwareBridgePort,
    private readonly reserveBatchStockUseCase: ReserveBatchStockUseCase,
    private readonly createInvoiceUseCase: CreateInvoiceUseCase,
  ) {}

  async execute(tenantId: string, terminalId: string, saleData: any): Promise<PosSale> {
    this.logger.log(`Processing POS sale for terminal ${terminalId} (Tenant: ${tenantId})`);

    const sale = new PosSale(tenantId, terminalId);
    sale.items = saleData.items;
    sale.total = saleData.total;

    try {
        // 1. Inventory Deduction
        const reservationItems = sale.items.map(item => ({
            warehouseId: saleData.warehouseId || 'default-wh',
            productSku: item.productId,
            quantity: item.quantity
        }));

        // Correct order: tenantId, items, reference
        await this.reserveBatchStockUseCase.execute(tenantId, reservationItems, `POS Sale ${sale.id}`);
        this.logger.log(`Stock reserved for POS sale ${sale.id}`);

        // 2. Automated Billing / Invoice Generation
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        await this.createInvoiceUseCase.execute({
            tenantId,
            customerId: saleData.customerId || 'walk-in-customer',
            dueDate: tomorrow.toISOString(),
            items: sale.items.map(i => ({
                productId: i.productId,
                quantity: i.quantity,
                unitPrice: parseFloat(i.price),
                description: i.productName || 'POS Item'
            })),
            paymentForm: saleData.paymentForm || '01',
            paymentMethod: saleData.paymentMethod || 'PUE',
            usage: saleData.usage || 'G03'
        });
        this.logger.log(`Invoice generated for POS sale ${sale.id}`);

        sale.status = PosSaleStatus.PAID;
        await this.posRepository.saveSale(sale);

        // 3. Hardware integration (Ticket printing)
        try {
            const ticketContent = `VIRTEEX ERP POS\nSale: ${sale.id}\nTerminal: ${sale.terminalId}\nTotal: ${sale.total}\nItems: ${sale.items.length}\nThanks for your purchase!`;
            await this.hardwareBridge.printTicket(ticketContent);
            await this.hardwareBridge.openDrawer();
        } catch (hwError: any) {
            this.logger.warn(`Hardware integration failed but sale was completed: ${hwError.message}`);
        }

        return sale;

    } catch (error: any) {
        this.logger.error(`POS sale processing failed: ${error.message}`);
        sale.status = PosSaleStatus.CANCELLED;
        await this.posRepository.saveSale(sale);
        throw error;
    }
  }
}
