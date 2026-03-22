import { Body, Controller, Get, Post, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { type CreateAccountDto, type RecordJournalEntryDto } from '@virteex/domain-accounting-contracts';
import { CreateAccountUseCase, RecordJournalEntryUseCase, GetAccountsUseCase, GetJournalEntriesUseCase } from '@virteex/domain-accounting-application';

@ApiTags('Accounting')
@Controller('accounting')
export class AccountingController {
  constructor(
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly recordJournalEntryUseCase: RecordJournalEntryUseCase,
    private readonly getAccountsUseCase: GetAccountsUseCase,
    private readonly getJournalEntriesUseCase: GetJournalEntriesUseCase,
  ) {}

  @Post('accounts')
  @ApiOperation({ summary: 'Create a new account' })
  async createAccount(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateAccountDto
  ) {
    return this.createAccountUseCase.execute({ ...dto, tenantId });
  }

  @Post('journal-entries')
  @ApiOperation({ summary: 'Record a new journal entry' })
  async recordJournalEntry(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: RecordJournalEntryDto
  ) {
    return this.recordJournalEntryUseCase.execute({ ...dto, tenantId });
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Get all accounts' })
  async getAccounts(@Headers('x-tenant-id') tenantId: string) {
    return this.getAccountsUseCase.execute(tenantId);
  }

  @Get('journal-entries')
  @ApiOperation({ summary: 'Get all journal entries' })
  async getJournalEntries(@Headers('x-tenant-id') tenantId: string) {
    return this.getJournalEntriesUseCase.execute(tenantId);
  }
}
