import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccountingQueryFacade } from '@virteex/domain-accounting-application';
import { CurrentTenant } from '@virteex/kernel-auth';

@ApiTags('Accounting (Internal)')
@Controller('internal/accounting')
export class AccountingInternalController {
  constructor(private readonly queryFacade: AccountingQueryFacade) {}

  @Get('journal-entries/count')
  @ApiOperation({ summary: 'Count journal entries (internal)' })
  async countJournalEntries(@CurrentTenant() tenantId: string) {
    const count = await this.queryFacade.countJournalEntries(tenantId);
    return { count };
  }

  @Get('metrics/monthly-opex')
  @ApiOperation({ summary: 'Get monthly OPEX (internal)' })
  async getMonthlyOpex(@CurrentTenant() tenantId: string) {
    const amount = await this.queryFacade.getMonthlyOpex(tenantId);
    return { amount };
  }
}
