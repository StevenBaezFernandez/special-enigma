import { PATH_METADATA } from '@nestjs/common/constants';
import { describe, it, expect } from 'vitest';
import { AppModule } from './app.module';
import { TenantsController } from '@virteex/domain-admin-presentation';

describe('Admin service smoke', () => {
  it('should register admin presentation module in module wiring', () => {
    const imports =
      (Reflect.getMetadata('imports', AppModule) as Array<{ name?: string }>) ?? [];
    const moduleNames = imports
      .map((m) => m.name)
      .filter((name): name is string => Boolean(name));

    expect(moduleNames).toContain('AdminPresentationModule');
  });

  it('should expose tenant management route prefix', () => {
    const routePrefix = Reflect.getMetadata(PATH_METADATA, TenantsController);

    expect(routePrefix).toBe('admin/tenants');
  });
});
