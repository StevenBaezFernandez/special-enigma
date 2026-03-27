import { Test, TestingModule } from '@nestjs/testing';
import { LocalizationController } from './localization.controller';
import { LocalizationPort } from '@virteex/domain-identity-domain';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('LocalizationController', () => {
  let controller: LocalizationController;
  let service: LocalizationPort;

  beforeEach(async () => {
    service = {
      getConfig: vi.fn(),
      lookup: vi.fn(),
      getFiscalRegions: vi.fn()
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalizationController],
      providers: [
        { provide: LocalizationPort, useValue: service }
      ]
    }).compile();

    controller = module.get<LocalizationController>(LocalizationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get config', async () => {
    const code = 'DO';
    const config = { countryCode: 'DO', name: 'Dominican Republic' };
    (service.getConfig as any).mockResolvedValue(config);

    const result = await controller.getConfig(code);
    expect(service.getConfig).toHaveBeenCalledWith(code);
    expect(result).toEqual(config);
  });

  it('should lookup tax id', async () => {
    const taxId = '123';
    const country = 'DO';
    const lookupResult = { taxId, country, isValid: true };
    (service.lookup as any).mockResolvedValue(lookupResult);

    const result = await controller.lookup(taxId, country);
    expect(service.lookup).toHaveBeenCalledWith(taxId, country);
    expect(result).toEqual(lookupResult);
  });
});
