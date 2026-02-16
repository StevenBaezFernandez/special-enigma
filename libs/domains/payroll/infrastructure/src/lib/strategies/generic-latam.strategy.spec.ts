import { Test, TestingModule } from '@nestjs/testing';
import { GenericLatamStrategy } from './generic-latam.strategy';
import { TaxTableRepository, TAX_TABLE_REPOSITORY, TaxTable } from '@virteex/payroll-domain';

describe('GenericLatamStrategy', () => {
  let strategy: GenericLatamStrategy;
  let repo: TaxTableRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenericLatamStrategy,
        {
          provide: TAX_TABLE_REPOSITORY,
          useValue: {
            findForYear: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<GenericLatamStrategy>(GenericLatamStrategy);
    repo = module.get<TaxTableRepository>(TAX_TABLE_REPOSITORY);
  });

  it('should calculate tax correctly for Argentina', async () => {
    const tables: TaxTable[] = [
      new TaxTable(0, 0, 0, 2025, 'MONTHLY', 'AR'),
      new TaxTable(1000, 10, 5, 2025, 'MONTHLY', 'AR'), // Fixed 10 + 5% of excess over 1000
    ];
    // Mock repo to return these tables
    (repo.findForYear as jest.Mock).mockResolvedValue(tables);

    const result = await strategy.calculatePayrollTaxes(2000, new Date('2025-01-01'), 'MONTHLY', { countryCode: 'AR' });

    // Calculation:
    // Income 2000 > 1000. Row is the second one.
    // Excess = 2000 - 1000 = 1000
    // Tax = 10 + (1000 * 5 / 100) = 10 + 50 = 60
    expect(result.totalTax).toBe(60);
    expect(repo.findForYear).toHaveBeenCalledWith(2025, 'MONTHLY', 'AR');
  });

  it('should return 0 if no tables found', async () => {
    (repo.findForYear as jest.Mock).mockResolvedValue([]);
    const result = await strategy.calculatePayrollTaxes(5000, new Date('2025-01-01'), 'MONTHLY', { countryCode: 'BO' });
    expect(result.totalTax).toBe(0);
  });
});
