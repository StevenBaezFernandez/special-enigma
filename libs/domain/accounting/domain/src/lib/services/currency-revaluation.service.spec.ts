import { CurrencyRevaluationService } from './currency-revaluation.service';

describe('CurrencyRevaluationService', () => {
  let service: CurrencyRevaluationService;

  beforeEach(() => {
    service = new CurrencyRevaluationService();
  });

  it('should calculate revaluation gain correctly', () => {
    const result = service.revalue('100.00', '1.0', '1.1');
    expect(result.newValue).toBe('110.00');
    expect(result.gainLoss).toBe('10.00');
  });

  it('should calculate revaluation loss correctly', () => {
    const result = service.revalue('100.00', '1.0', '0.9');
    expect(result.newValue).toBe('90.00');
    expect(result.gainLoss).toBe('-10.00');
  });
});
