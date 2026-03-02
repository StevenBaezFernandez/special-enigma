import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { MexicanTaxStrategy } from './mexican-tax.strategy';
import { TAX_TABLE_REPOSITORY, MissingTaxTableException } from '@virteex/domain-payroll-domain';

const mockTaxTableRepository = {
  findForYear: vi.fn(),
};

describe('MexicanTaxStrategy', () => {
  let strategy: MexicanTaxStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MexicanTaxStrategy,
        { provide: TAX_TABLE_REPOSITORY, useValue: mockTaxTableRepository },
      ],
    }).compile();

    strategy = module.get<MexicanTaxStrategy>(MexicanTaxStrategy);
    jest.clearAllMocks();
  });

  it('should calculate tax correctly for MONTHLY frequency', async () => {
    const tables = [
      { limit: 6332.06, fixed: 371.83, percent: 10.88 },
      { limit: 746.05, fixed: 14.32, percent: 6.40 },
      { limit: 0.01, fixed: 0, percent: 1.92 },
    ];
    mockTaxTableRepository.findForYear.mockResolvedValue(tables);

    const income = 10000;
    // Calculation: (10000 - 6332.06) * 0.1088 + 371.83 = 770.90

    const result = await strategy.calculateTax(income, new Date('2024-01-01'), 'MONTHLY');

    expect(mockTaxTableRepository.findForYear).toHaveBeenCalledWith(2024, 'MONTHLY');
    expect(result).toBe(770.90);
  });

  it('should use default frequency if not provided', async () => {
     mockTaxTableRepository.findForYear.mockResolvedValue([]);
     try {
        await strategy.calculateTax(1000, new Date());
     } catch (e) {
         // Ignore
     }
     expect(mockTaxTableRepository.findForYear).toHaveBeenCalledWith(expect.any(Number), 'MONTHLY');
  });

  it('should throw MissingTaxTableException if no tables found', async () => {
    mockTaxTableRepository.findForYear.mockResolvedValue([]);
    await expect(strategy.calculateTax(1000, new Date(), 'WEEKLY'))
      .rejects.toThrow(MissingTaxTableException);
  });
});
