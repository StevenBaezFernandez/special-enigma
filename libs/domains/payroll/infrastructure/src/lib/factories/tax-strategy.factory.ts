import { Injectable, Logger } from '@nestjs/common';
import { TaxStrategyFactory, TaxService } from '@virteex/payroll-domain';
import { MexicanTaxStrategy } from '../strategies/mexican-tax.strategy';
import { USPayrollStrategy } from '../strategies/us-payroll.strategy';
import { GenericLatamStrategy } from '../strategies/generic-latam.strategy';
import { CountryCode } from '@virteex/shared-util-server-config';

@Injectable()
export class TaxStrategyFactoryImpl implements TaxStrategyFactory {
  private readonly logger = new Logger(TaxStrategyFactoryImpl.name);

  constructor(
    private readonly mexican: MexicanTaxStrategy,
    private readonly us: USPayrollStrategy,
    private readonly genericLatam: GenericLatamStrategy
  ) {}

  getStrategy(country: string): TaxService {
    if (!country) return this.mexican;

    const upperCountry = country.toUpperCase();

    // Specific strategies
    if (upperCountry === CountryCode.USA || upperCountry === 'US') {
      return this.us;
    }
    if (upperCountry === CountryCode.MEXICO || upperCountry === 'MX') {
      return this.mexican;
    }

    // Generic Latam fallback for known LATAM countries
    // We check if the country code is in our supported list excluding US/MX which are handled above
    const latamCountries = Object.values(CountryCode).filter(c => c !== CountryCode.USA && c !== CountryCode.MEXICO);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (latamCountries.includes(upperCountry as any)) {
      return this.genericLatam;
    }

    this.logger.warn(`No specific strategy found for country ${country}. Defaulting to Mexican strategy as fallback.`);
    return this.mexican;
  }
}
