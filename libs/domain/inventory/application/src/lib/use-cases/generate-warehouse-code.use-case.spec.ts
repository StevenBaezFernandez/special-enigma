import { describe, expect, it } from 'vitest';
import { GenerateWarehouseCodeUseCase } from './generate-warehouse-code.use-case';

describe('GenerateWarehouseCodeUseCase', () => {
  it('should generate code with 3-char prefix and 3-char suffix', () => {
    const useCase = new GenerateWarehouseCodeUseCase();
    const code = useCase.execute('Main Warehouse');

    expect(code).toMatch(/^MAI-[A-F0-9]{3}$/);
  });
});
