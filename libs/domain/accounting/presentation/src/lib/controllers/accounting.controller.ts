import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateAccountDto, RecordJournalEntryDto, GenerateFinancialReportDto, CloseFiscalPeriodDto } from '@virteex/domain-accounting-contracts';
import {
  CreateAccountUseCase,
  RecordJournalEntryUseCase,
  GetAccountsUseCase,
  GetJournalEntriesUseCase,
  SetupChartOfAccountsUseCase,
  GenerateFinancialReportUseCase,
  CloseFiscalPeriodUseCase
} from '@virteex/domain-accounting-application';
import { CurrentTenant } from '@virteex/kernel-auth';

@ApiTags('Accounting')
@Controller('accounting')
export class AccountingController {
  constructor(
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly recordJournalEntryUseCase: RecordJournalEntryUseCase,
    private readonly getAccountsUseCase: GetAccountsUseCase,
    private readonly getJournalEntriesUseCase: GetJournalEntriesUseCase,
    private readonly setupChartOfAccountsUseCase: SetupChartOfAccountsUseCase,
    private readonly generateFinancialReportUseCase: GenerateFinancialReportUseCase,
    private readonly closeFiscalPeriodUseCase: CloseFiscalPeriodUseCase,
  ) {}

  @Post('accounts')
  @ApiOperation({ summary: 'Create a new account' })
  async createAccount(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateAccountDto
  ) {
    return this.createAccountUseCase.execute({ ...dto, tenantId });
  }

  @Post('journal-entries')
  @ApiOperation({ summary: 'Record a new journal entry' })
  async recordJournalEntry(
    @CurrentTenant() tenantId: string,
    @Body() dto: RecordJournalEntryDto
  ) {
    return this.recordJournalEntryUseCase.execute({ ...dto, tenantId });
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Get all accounts' })
  async getAccounts(@CurrentTenant() tenantId: string) {
    return this.getAccountsUseCase.execute(tenantId);
  }

  @Get('journal-entries')
  @ApiOperation({ summary: 'Get all journal entries' })
  async getJournalEntries(@CurrentTenant() tenantId: string) {
    return this.getJournalEntriesUseCase.execute(tenantId);
  }

  @Post('setup')
  @ApiOperation({ summary: 'Setup initial chart of accounts' })
  async setupChartOfAccounts(@CurrentTenant() tenantId: string) {
    return this.setupChartOfAccountsUseCase.execute(tenantId);
  }

  @Get('reports/financial')
  @ApiOperation({ summary: 'Generate financial report' })
  async generateFinancialReport(
    @CurrentTenant() tenantId: string,
    @Query() dto: GenerateFinancialReportDto
  ) {
    return this.generateFinancialReportUseCase.execute(tenantId, dto.type, new Date(dto.endDate), dto.dimensions);
  }

  @Post('closing')
  @ApiOperation({ summary: 'Close fiscal period' })
  async closeFiscalPeriod(
    @CurrentTenant() tenantId: string,
    @Body() dto: CloseFiscalPeriodDto
  ) {
    return this.closeFiscalPeriodUseCase.execute(tenantId, new Date(dto.closingDate));
  }
}
