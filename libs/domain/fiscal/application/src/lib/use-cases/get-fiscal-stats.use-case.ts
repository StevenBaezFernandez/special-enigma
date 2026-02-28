import { Injectable, Inject } from '@nestjs/common';
import { FiscalDataProvider, FISCAL_DATA_PROVIDER } from '@virteex/domain-fiscal-domain';

@Injectable()
export class GetFiscalStatsUseCase {
  constructor(
    @Inject(FISCAL_DATA_PROVIDER)
    private readonly fiscalDataProvider: FiscalDataProvider
  ) {}

  execute(tenantId: string) {
    return this.fiscalDataProvider.getFiscalStats(tenantId);
  }
}
