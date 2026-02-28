import { Test, TestingModule } from '@nestjs/testing';
import { PayrollCalculationService } from './payroll-calculation.service';
import { TAX_STRATEGY_FACTORY } from '../ports/tax-strategy.factory';

describe('PayrollCalculationService', () => {
  let service: PayrollCalculationService;
  const mockStrategy = {
      calculateTax: jest.fn(),
      calculatePayrollTaxes: jest.fn()
  };
  const mockFactory = {
      getStrategy: jest.fn().mockReturnValue(mockStrategy)
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
      const tax = await service.calculateIsr(5000, 2024); // country defaults to MX
      expect(mockFactory.getStrategy).toHaveBeenCalledWith('MX');
      expect(mockStrategy.calculateTax).toHaveBeenCalled();
      expect(tax).toBe(100);
  });

  it('should calculate IMSS for MX (Legacy)', () => {
      // Logic still exists in service for MX
      const imss = service.calculateImss(500, 15);
      expect(imss).toBeCloseTo(188.58, 2);
  });
});
