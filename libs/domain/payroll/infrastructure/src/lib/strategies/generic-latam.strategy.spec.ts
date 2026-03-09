import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { GenericLatamStrategy } from './generic-latam.strategy';
import { TaxTableRepository, TAX_TABLE_REPOSITORY, TaxTable } from '@virteex/domain-payroll-domain';

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
            findForYear: vi.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<GenericLatamStrategy>(GenericLatamStrategy);
    repo = module.get<TaxTableRepository>(TAX_TABLE_REPOSITORY);
  });

  it('should calculate tax correctly for Argentina', async () => {
    const tables: TaxTable[] = [
      new TaxTable('SYSTEM', 0, 0, 0, 2025, 'MONTHLY', 'AR'),
      new TaxTable('SYSTEM', 1000, 10, 5, 2025, 'MONTHLY', 'AR'),
    ];
    (repo.findForYear as any).mockResolvedValue(tables);

    const result = await strategy.calculatePayrollTaxes(2000, new Date('2025-01-01'), 'MONTHLY', { countryCode: 'AR' });

    expect(result.totalTax).toBe(60);
  });

  it('should apply Colombia social security rules', async () => {
    (repo.findForYear as any).mockResolvedValue([]);
    const income = 2000000; // > 1,300,000 SMLV
    const result = await strategy.calculatePayrollTaxes(income, new Date('2024-01-01'), 'MONTHLY', { countryCode: 'CO' });

    // Salud 4% = 80,000
    // Pension 4% = 80,000
    const salud = result.details.find(d => d.name === 'Salud (CO)');
    const pension = result.details.find(d => d.name === 'Pensión (CO)');

    expect(salud?.amount).toBe(80000);
    expect(pension?.amount).toBe(80000);
  });

  it('should apply Brazil progressive INSS rules', async () => {
    (repo.findForYear as any).mockResolvedValue([]);
    const income = 3000;
    const result = await strategy.calculatePayrollTaxes(income, new Date('2024-01-01'), 'MONTHLY', { countryCode: 'BR' });

    // Tier 1: 1412 * 0.075 = 105.90
    // Tier 2: (2666.68 - 1412) * 0.09 = 1254.68 * 0.09 = 112.92
    // Tier 3: (3000 - 2666.68) * 0.12 = 333.32 * 0.12 = 39.9984 -> 40.00
    // Total = 105.90 + 112.92 + 40.00 = 258.82
    const inss = result.details.find(d => d.name === 'INSS (BR)');
    expect(inss?.amount).toBeCloseTo(258.82, 1);
  });

  it('should return 0 if no tables found', async () => {
    (repo.findForYear as any).mockResolvedValue([]);
    const result = await strategy.calculatePayrollTaxes(5000, new Date('2025-01-01'), 'MONTHLY', { countryCode: 'BO' });
    expect(result.totalTax).toBe(0);
  });
});
