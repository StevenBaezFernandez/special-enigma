import { Test, TestingModule } from '@nestjs/testing';
import { PayrollCalculationService } from './payroll-calculation.service';
import { TAX_TABLE_REPOSITORY } from '../repositories/tax-table.repository';
import { TaxTable } from '../entities/tax-table.entity';

describe('PayrollCalculationService', () => {
  let service: PayrollCalculationService;
  const mockTaxRepo = { findForYear: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollCalculationService,
        { provide: TAX_TABLE_REPOSITORY, useValue: mockTaxRepo },
      ],
    }).compile();

    service = module.get<PayrollCalculationService>(PayrollCalculationService);
  });

  it('should calculate ISR correctly', async () => {
    // Mock 2024 Tables
    const tables = [
        new TaxTable(0.01, 0, 1.92, 2024),
        new TaxTable(746.05, 14.32, 6.40, 2024),
        new TaxTable(6332.06, 371.83, 10.88, 2024),
    ];
    mockTaxRepo.findForYear.mockResolvedValue(tables);

    // Test with income 5000 (Falls in second bracket)
    // Base = 5000 - 746.05 = 4253.95
    // Tax = 14.32 + (4253.95 * 0.064) = 14.32 + 272.2528 = 286.57
    const tax = await service.calculateIsr(5000, 2024);
    expect(tax).toBeCloseTo(286.57, 2);
  });

  it('should calculate IMSS correctly', () => {
      // Standard calculation test
      // Daily Salary = 500. Days = 15. Total = 7500.
      // UMA 2024 = 108.57
      // 3 UMA = 325.71. SBC 500 > 3 UMA.
      // Base: 7500 * 0.02375 = 178.125
      // Surplus: (500 - 325.71) * 15 * 0.004 = 174.29 * 15 * 0.004 = 10.4574
      // Total: 178.125 + 10.4574 = 188.5824 -> 188.58
      const imss = service.calculateImss(500, 15);
      expect(imss).toBeCloseTo(188.58, 2);
  });
});
