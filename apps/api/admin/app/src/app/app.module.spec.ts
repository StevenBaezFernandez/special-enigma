import { PATH_METADATA } from '@nestjs/common/constants';

import { AppModule } from './app.module';
import { TenantsController } from './tenants.controller';

describe('Admin service smoke', () => {
  it('should register tenants controller in module wiring', () => {
    const controllers =
      (Reflect.getMetadata('controllers', AppModule) as Array<{ name?: string }>) ?? [];
    const controllerNames = controllers
      .map((controller) => controller.name)
      .filter((name): name is string => Boolean(name));

    expect(controllerNames).toContain(TenantsController.name);
  });

  it('should expose tenant management route prefix', () => {
    const routePrefix = Reflect.getMetadata(PATH_METADATA, TenantsController);

    expect(routePrefix).toBe('admin/tenants');
  });
});
