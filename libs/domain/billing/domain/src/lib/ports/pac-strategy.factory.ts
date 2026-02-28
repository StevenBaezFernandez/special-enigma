import { PacProvider } from './pac-provider.port';

export interface PacStrategyFactory {
  getProvider(country: string): PacProvider;
}

export const PAC_STRATEGY_FACTORY = 'PAC_STRATEGY_FACTORY';
