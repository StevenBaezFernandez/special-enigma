import { describe, it, expect, beforeEach } from 'vitest';
import { Stock } from './stock.entity';
import { Warehouse } from './warehouse.entity';

describe('Stock Entity', () => {
  let warehouse: Warehouse;

  beforeEach(() => {
    warehouse = new Warehouse('tenant-1', 'WH-1', 'Main Warehouse');
  });

  it('should initialize with quantity', () => {
    const stock = new Stock('tenant-1', 'prod-1', warehouse, '10');
    expect(stock.quantity).toBe('10');
  });

  it('should add quantity', () => {
    const stock = new Stock('tenant-1', 'prod-1', warehouse, '10');
    stock.addQuantity('5.5');
    expect(stock.quantity).toBe('15.5');
  });

  it('should remove quantity', () => {
    const stock = new Stock('tenant-1', 'prod-1', warehouse, '10');
    stock.removeQuantity('3');
    expect(stock.quantity).toBe('7');
  });

  it('should throw error when removing more than available', () => {
    const stock = new Stock('tenant-1', 'prod-1', warehouse, '10');
    expect(() => stock.removeQuantity('11')).toThrow('Insufficient stock');
  });
});
