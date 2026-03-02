import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { CatalogProductReadGateway } from './catalog-product-read.gateway';

describe('CatalogProductReadGateway', () => {
  const httpService = { get: vi.fn() } as any;
  const configService = { get: vi.fn() } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockImplementation((key: string) => {
      if (key === 'CATALOG_SERVICE_URL') return 'http://catalog.local';
      return undefined;
    });
  });

  it('returns product tenant when catalog product exists', async () => {
    httpService.get.mockReturnValue(of({ data: { id: 10, tenantId: 'tenant-a' } }));
    const gateway = new CatalogProductReadGateway(httpService, configService);

    await expect(gateway.exists('10')).resolves.toBe(true);
    await expect(gateway.getTenantId('10')).resolves.toBe('tenant-a');
  });

  it('returns null/false on catalog 404', async () => {
    httpService.get.mockReturnValue(throwError(() => ({ response: { status: 404 } })));
    const gateway = new CatalogProductReadGateway(httpService, configService);

    await expect(gateway.exists('99')).resolves.toBe(false);
    await expect(gateway.getTenantId('99')).resolves.toBeNull();
  });

  it('returns null/false for invalid product ids without calling catalog', async () => {
    const gateway = new CatalogProductReadGateway(httpService, configService);

    await expect(gateway.exists('bad-id')).resolves.toBe(false);
    await expect(gateway.getTenantId('-1')).resolves.toBeNull();
    expect(httpService.get).not.toHaveBeenCalled();
  });
});
