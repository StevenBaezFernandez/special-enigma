import { describe, expect, it } from 'vitest';
import { PacStrategyFactoryImpl } from './pac-strategy.factory';

describe('PacStrategyFactoryImpl', () => {
  it('blocks simulated providers in production even if explicitly enabled', () => {
    const configService = {
      get: (key: string) => {
        if (key === 'NODE_ENV') return 'production';
        if (key === 'ALLOW_SIMULATED_PROVIDERS') return 'true';
        return undefined;
      }
    } as any;

    const factory = new PacStrategyFactoryImpl(configService, {} as any, {} as any);
    expect(() => factory.getProvider('CO')).toThrow(/cannot be true in production/);
  });
});
