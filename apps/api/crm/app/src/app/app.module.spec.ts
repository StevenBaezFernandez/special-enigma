import { AppModule } from './app.module';

describe('AppModule smoke', () => {
  it('should expose module bootstrap metadata', () => {
    expect(AppModule).toBeDefined();
    const importedModules =
      (Reflect.getMetadata('imports', AppModule) as Array<{ module?: { name?: string }; name?: string }>) ?? [];

    const importedModuleNames = importedModules
      .map((importedModule) => importedModule.module?.name ?? importedModule.name)
      .filter((name): name is string => Boolean(name));

    expect(importedModuleNames).toContain('GraphQLModule');
    expect(importedModuleNames.some((name) => name.endsWith('PresentationModule'))).toBe(true);
  });

  it('should define provider and controller wiring collections', () => {
    const providers = Reflect.getMetadata('providers', AppModule) ?? [];
    const controllers = Reflect.getMetadata('controllers', AppModule) ?? [];

    expect(Array.isArray(providers)).toBe(true);
    expect(Array.isArray(controllers)).toBe(true);
  });
});
