import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MikroOrmPosRepository } from '../repositories/mikro-orm-pos.repository';

describe('MikroOrmPosRepository Level 5 Persistence', () => {
  let repository: MikroOrmPosRepository;
  let mockEm: any;
  let mockDq: any;

  beforeEach(() => {
    mockEm = {
      persistAndFlush: vi.fn().mockResolvedValue(undefined),
    };
    mockDq = {
      validatePosSaleInvariants: vi.fn().mockResolvedValue(undefined),
    };
    repository = new MikroOrmPosRepository(mockEm as any, mockDq as any);
  });

  it('SHOULD allow saving sale if invariants pass', async () => {
    const sale: any = { id: 's1', items: [{ id: 'i1', price: 10, quantity: 1 }] };
    await repository.saveSale(sale);
    expect(mockDq.validatePosSaleInvariants).toHaveBeenCalledWith(sale);
    expect(mockEm.persistAndFlush).toHaveBeenCalledWith(sale);
  });

  it('SHOULD block saving sale (fail-closed) if invariants fail', async () => {
    const invalidSale: any = { id: 's2', items: [] };
    mockDq.validatePosSaleInvariants = vi.fn().mockRejectedValue(new Error('Inconsistency: No items'));

    await expect(repository.saveSale(invalidSale)).rejects.toThrow('Inconsistency: No items');
    expect(mockEm.persistAndFlush).not.toHaveBeenCalled();
  });
});
