import { Test, TestingModule } from '@nestjs/testing';
import { LocalizationService } from './localization.service';
import { describe, beforeEach, it, expect } from 'vitest';

describe('LocalizationService', () => {
  let service: LocalizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalizationService],
    }).compile();

    service = module.get<LocalizationService>(LocalizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return config for a known country', async () => {
    const config = await service.getConfig('DO');
    expect(config.countryCode).toBe('DO');
    expect(config.name).toBe('República Dominicana');
    expect(config.currency).toBe('DOP');
  });

  it('should return default config for an unknown country', async () => {
    const config = await service.getConfig('XX');
    expect(config.countryCode).toBe('XX');
    expect(config.currency).toBe('USD');
    expect(config.fiscalRegionId).toBe('GEN');
  });

  it('should validate taxId correctly according to regex and use provider', async () => {
    // DO regex is ^[0-9]{9,11}$
    // 101010101 is a known taxId in DominicanRepublicTaxProvider
    const validLookup = await service.lookup('101010101', 'DO');
    expect(validLookup.isValid).toBe(true);
    expect(validLookup.name).toBe('VIRTEEX DOMINICANA SRL');
    expect(validLookup.legalName).toBe('VIRTEEX DOMINICANA SRL');

    const invalidLookup = await service.lookup('ABC', 'DO');
    expect(invalidLookup.isValid).toBe(false);
  });

  it('should return invalid for taxId starting with 000', async () => {
    const lookup = await service.lookup('000123456', 'DO');
    expect(lookup.isValid).toBe(false);
  });
});
