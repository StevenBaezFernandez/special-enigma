import { Test, TestingModule } from '@nestjs/testing';
import { ProcessSaleUseCase } from '../process-sale.use-case';
import { PosRepository, PosSale, PosSaleStatus, HARDWARE_BRIDGE_PORT, HardwareBridgePort } from '@virteex/domain-pos-domain';
import { ReserveBatchStockUseCase } from '@virteex/domain-inventory-application';
import { CreateInvoiceUseCase } from '@virteex/domain-billing-application';
import { vi, Mock } from 'vitest';

describe('ProcessSaleUseCase', () => {
  let useCase: ProcessSaleUseCase;
  let posRepository: PosRepository;
  let hardwareBridge: HardwareBridgePort;
  let reserveStockUseCase: ReserveBatchStockUseCase;
  let createInvoiceUseCase: CreateInvoiceUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessSaleUseCase,
        {
          provide: 'PosRepository',
          useValue: { saveSale: vi.fn() }
        },
        {
          provide: HARDWARE_BRIDGE_PORT,
          useValue: { printTicket: vi.fn().mockResolvedValue({ success: true }), openDrawer: vi.fn().mockResolvedValue({ success: true }) }
        },
        {
          provide: ReserveBatchStockUseCase,
          useValue: { execute: vi.fn().mockResolvedValue(undefined) }
        },
        {
          provide: CreateInvoiceUseCase,
          useValue: { execute: vi.fn().mockResolvedValue({ id: 'inv_123' }) }
        }
      ]
    }).compile();

    useCase = module.get<ProcessSaleUseCase>(ProcessSaleUseCase);
    posRepository = module.get<PosRepository>('PosRepository');
    hardwareBridge = module.get<HardwareBridgePort>(HARDWARE_BRIDGE_PORT);
    reserveStockUseCase = module.get<ReserveBatchStockUseCase>(ReserveBatchStockUseCase);
    createInvoiceUseCase = module.get<CreateInvoiceUseCase>(CreateInvoiceUseCase);
  });

  it('should process a sale successfully with inventory and billing integration', async () => {
    const saleData = {
      terminalId: 'term_1',
      total: '100.00',
      warehouseId: 'wh_1',
      items: [
        { productId: 'prod_1', productName: 'Test Product', price: '100.00', quantity: 1 }
      ]
    };

    const result = await useCase.execute('tenant_1', 'term_1', saleData);

    expect(result.status).toBe(PosSaleStatus.PAID);
    expect(posRepository.saveSale).toHaveBeenCalled();
    expect(reserveStockUseCase.execute).toHaveBeenCalled();
    expect(createInvoiceUseCase.execute).toHaveBeenCalled();
    expect(hardwareBridge.printTicket).toHaveBeenCalled();
    expect(hardwareBridge.openDrawer).toHaveBeenCalled();
  });

  it('should cancel sale and throw error if inventory reservation fails', async () => {
    (reserveStockUseCase.execute as Mock).mockRejectedValue(new Error('Out of stock'));

    const saleData = {
      terminalId: 'term_1',
      total: '100.00',
      items: [{ productId: 'prod_1', quantity: 10 }]
    };

    await expect(useCase.execute('tenant_1', 'term_1', saleData)).rejects.toThrow('Out of stock');
    expect(posRepository.saveSale).toHaveBeenCalledWith(expect.objectContaining({ status: PosSaleStatus.CANCELLED }));
  });
});
