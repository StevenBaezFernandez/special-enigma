import { Body, Controller, Get, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { CreateAccountDto, RecordJournalEntryDto, GenerateFinancialReportDto, CloseFiscalPeriodDto, FinancialReportDto } from '@virteex/domain-accounting-contracts';
import {
  AccountingCommandFacade,
  AccountingQueryFacade
} from '@virteex/domain-accounting-application';
import { CurrentTenant } from '@virteex/kernel-auth';
import { IdempotencyInterceptor } from '@virteex/shared-util-server-server-config';

@ApiTags('Accounting')
@Controller('accounting')
@UseInterceptors(IdempotencyInterceptor)
export class AccountingController {
  constructor(
    private readonly commandFacade: AccountingCommandFacade,
    private readonly queryFacade: AccountingQueryFacade,
  ) {}

  @Post('accounts')
  @ApiOperation({ summary: 'Create a new account' })
  async createAccount(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateAccountDto
  ) {
    return this.commandFacade.createAccount({ ...dto, tenantId });
  }

  @Post('journal-entries')
  @ApiOperation({ summary: 'Record a new journal entry' })
  @ApiHeader({ name: 'x-idempotency-key', required: false, description: 'Optional idempotency key' })
  async recordJournalEntry(
    @CurrentTenant() tenantId: string,
    @Body() dto: RecordJournalEntryDto
  ) {
    return this.commandFacade.recordJournalEntry({ ...dto, tenantId });
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Get all accounts' })
  async getAccounts(@CurrentTenant() tenantId: string) {
    return this.queryFacade.getAccounts(tenantId);
  }

  @Get('journal-entries')
  @ApiOperation({ summary: 'Get all journal entries' })
  async getJournalEntries(@CurrentTenant() tenantId: string) {
    return this.queryFacade.getJournalEntries(tenantId);
  }

  @Post('setup')
  @ApiOperation({ summary: 'Setup initial chart of accounts' })
  async setupChartOfAccounts(@CurrentTenant() tenantId: string) {
    return this.commandFacade.setupChartOfAccounts(tenantId);
  }

  @Get('reports/financial')
  @ApiOperation({ summary: 'Generate financial report' })
  async generateFinancialReport(
    @CurrentTenant() tenantId: string,
    @Query() dto: GenerateFinancialReportDto
  ): Promise<FinancialReportDto> {
    const report = await this.queryFacade.generateFinancialReport(tenantId, dto.type, new Date(dto.endDate), dto.dimensions);
    return {
        ...report,
        generatedAt: report.generatedAt.toISOString()
    };
  }

  @Post('closing')
  @ApiOperation({ summary: 'Close fiscal period' })
  @ApiHeader({ name: 'x-idempotency-key', required: false, description: 'Optional idempotency key' })
  async closeFiscalPeriod(
    @CurrentTenant() tenantId: string,
    @Body() dto: CloseFiscalPeriodDto
  ) {
    return this.commandFacade.closeFiscalPeriod(tenantId, new Date(dto.closingDate));
  }
}
