import { Injectable } from '@nestjs/common';
import { PacStrategyFactory, PacProvider } from '@virteex/billing-domain';
import { FinkokPacProvider } from '../providers/finkok-pac.provider';
import { NullPacProvider } from '../providers/null-pac.provider';

@Injectable()
export class PacStrategyFactoryImpl implements PacStrategyFactory {
  constructor(
    private readonly finkok: FinkokPacProvider,
    private readonly nullProvider: NullPacProvider
  ) {}

  getProvider(country: string): PacProvider {
    if (!country) return this.nullProvider;

    switch (country.toUpperCase()) {
      case 'MX':
      case 'MEXICO':
        return this.finkok;
      default:
        return this.nullProvider;
    }
  }
}
