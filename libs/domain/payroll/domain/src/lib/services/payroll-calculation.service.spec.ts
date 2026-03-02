import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PayrollCalculationService } from './payroll-calculation.service';
import { TAX_STRATEGY_FACTORY } from '../ports/tax-strategy.factory';

describe('PayrollCalculationService', () => {
  let service: PayrollCalculationService;
  const mockStrategy = {
      calculateTax: vi.fn(),
      calculatePayrollTaxes: vi.fn()
  };
  const mockFactory = {
      getStrategy: vi.fn().mockReturnValue(mockStrategy)
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollCalculationService,
        { provide: TAX_STRATEGY_FACTORY, useValue: mockFactory },
      ],
    }).compile();

    service = module.get<PayrollCalculationService>(PayrollCalculationService);
  });

  it('should delegate ISR calculation to strategy', async () => {
      mockStrategy.calculateTax.mockResolvedValue(100);
      const tax = await service.calculateIsr(mockFactory as any, 5000, 2024); // country defaults to MX
      expect(mockFactory.getStrategy).toHaveBeenCalledWith('MX');
      expect(mockStrategy.calculateTax).toHaveBeenCalled();
      expect(tax).toBe(100);
  });

  it('should calculate proportional salary correctly', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-15');
      const salary = service.calculateProportionalSalary(3000, start, end);
      // 15 days = 1500
      expect(salary).toBe(1500);
  });
});
