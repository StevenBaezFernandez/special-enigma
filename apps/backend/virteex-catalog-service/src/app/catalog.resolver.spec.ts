import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CatalogResolver } from './catalog.resolver';
import { GetSatCatalogsUseCase, GetProductsUseCase } from '@virteex/application-catalog-application';
import { ConfigService } from '@nestjs/config';

describe('CatalogResolver', () => {
  let resolver: CatalogResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogResolver,
        {
          provide: GetSatCatalogsUseCase,
          useValue: {
            getPaymentMethods: vi.fn().mockResolvedValue([]),
            getPaymentForms: vi.fn().mockResolvedValue([]),
            getCfdiUsages: vi.fn().mockResolvedValue([]),
          },
        },
        {
          provide: GetProductsUseCase,
          useValue: {
            execute: vi.fn().mockResolvedValue([]),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<CatalogResolver>(CatalogResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
