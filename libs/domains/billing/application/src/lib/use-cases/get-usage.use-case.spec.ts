import { Test, TestingModule } from '@nestjs/testing';
import { GetUsageUseCase } from './get-usage.use-case';
import { ConfigService } from '@nestjs/config';
import { INVOICE_REPOSITORY, SUBSCRIPTION_REPOSITORY } from '@virteex/domain-billing-domain';

const mockInvoiceRepository = {
  countByTenantId: jest.fn(),
};

const mockSubscriptionRepository = {
  findByTenantId: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string, defaultValue: unknown) => defaultValue),
};

describe('GetUsageUseCase', () => {
  let useCase: GetUsageUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUsageUseCase,
        { provide: INVOICE_REPOSITORY, useValue: mockInvoiceRepository },
        { provide: SUBSCRIPTION_REPOSITORY, useValue: mockSubscriptionRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    useCase = module.get<GetUsageUseCase>(GetUsageUseCase);
    jest.clearAllMocks();
  });

  it('should return usage based on countByTenantId and default limits', async () => {
    const tenantId = 'tenant-1';
    mockInvoiceRepository.countByTenantId.mockResolvedValue(5);
    mockSubscriptionRepository.findByTenantId.mockResolvedValue(null);

    const result = await useCase.execute(tenantId);

    expect(mockInvoiceRepository.countByTenantId).toHaveBeenCalledWith(tenantId);
    expect(result).toHaveLength(1);
    expect(result[0].used).toBe(5);
    expect(result[0].limit).toBe(10); // Default limit
  });

  it('should return usage based on subscription limits', async () => {
    const tenantId = 'tenant-2';
    mockInvoiceRepository.countByTenantId.mockResolvedValue(20);
    mockSubscriptionRepository.findByTenantId.mockResolvedValue({
      isValid: () => true,
      plan: {
        limits: {
          invoices: 100,
          users: 5,
          storage: 100
        }
      }
    });

    const result = await useCase.execute(tenantId);

    expect(result[0].used).toBe(20);
    expect(result[0].limit).toBe(100);
  });
});
