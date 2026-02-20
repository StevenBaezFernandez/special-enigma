import { Test, TestingModule } from '@nestjs/testing';
import { CatalogResolver } from './catalog.resolver';
import { GetSatCatalogsUseCase, GetProductsUseCase } from '@virteex/catalog-application';
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
            getPaymentMethods: jest.fn().mockResolvedValue([]),
            getPaymentForms: jest.fn().mockResolvedValue([]),
            getCfdiUsages: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: GetProductsUseCase,
          useValue: {
            execute: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
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
