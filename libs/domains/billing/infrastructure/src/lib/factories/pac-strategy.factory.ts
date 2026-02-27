import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PacStrategyFactory, PacProvider } from '@virteex/domain-billing-domain';
import { FinkokPacProvider } from '../providers/finkok-pac.provider';
import { NullPacProvider } from '../providers/null-pac.provider';

@Injectable()
export class PacStrategyFactoryImpl implements PacStrategyFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly finkok: FinkokPacProvider,
    private readonly nullProvider: NullPacProvider
  ) {}

  getProvider(country: string): PacProvider {
    const normalizedCountry = country?.toUpperCase();
    const nodeEnv = this.configService.get<string>('NODE_ENV') ?? 'development';
    const allowSimulatedProviders = this.configService.get<string>('ALLOW_SIMULATED_PROVIDERS') === 'true';

    if (!normalizedCountry) {
      if (nodeEnv === 'production') {
        throw new Error('Country is required to select a fiscal PAC provider in production.');
      }
      if (!allowSimulatedProviders) {
        throw new Error('Simulated providers are disabled. Configure a real fiscal provider.');
      }
      return this.nullProvider;
    }

    switch (normalizedCountry) {
      case 'MX':
      case 'MEXICO':
        return this.finkok;
      default:
        if (nodeEnv === 'production') {
          throw new Error(`No production PAC provider configured for country ${normalizedCountry}.`);
        }
        if (!allowSimulatedProviders) {
          throw new Error(
            `Simulated providers are disabled and no fiscal provider is configured for ${normalizedCountry}.`
          );
        }
        return this.nullProvider;
    }
  }
}
