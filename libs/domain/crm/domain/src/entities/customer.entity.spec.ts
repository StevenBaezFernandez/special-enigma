import { Customer } from './customer.entity';
import { CustomerType } from '@virteex/shared-contracts';
import { describe, it, expect } from 'vitest';

describe('Customer Entity - Dominican Republic Tax ID Validation', () => {
  it('should validate a correct RNC (9 digits)', () => {
    const customer = new Customer('tenant-1', CustomerType.COMPANY);
    customer.country = 'DO';
    customer.taxId = '101656204';
    expect(() => customer.validateTaxId()).not.toThrow();
  });

  it('should validate a correct Cédula (11 digits)', () => {
    const customer = new Customer('tenant-1', CustomerType.INDIVIDUAL);
    customer.country = 'DO';
    customer.taxId = '00113918312';
    expect(() => customer.validateTaxId()).not.toThrow();
  });
});
