import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CreateAccountDto,
  RecordJournalEntryDto,
} from '@virteex/contracts-accounting-contracts';
import { CreateAccountUseCase } from '@virteex/application-accounting-application/lib/use-cases/create-account.use-case';
import { RecordJournalEntryUseCase } from '@virteex/application-accounting-application/lib/use-cases/record-journal-entry.use-case';
import { GetAccountsUseCase } from '@virteex/application-accounting-application/lib/use-cases/get-accounts.use-case';
import { GetJournalEntriesUseCase } from '@virteex/application-accounting-application/lib/use-cases/get-journal-entries.use-case';

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
  async createAccount(@Body() dto: CreateAccountDto) {
    return this.createAccountUseCase.execute(dto);
  }

  @Post('journal-entries')
  @ApiOperation({ summary: 'Record a new journal entry' })
  async recordJournalEntry(@Body() dto: RecordJournalEntryDto) {
    return this.recordJournalEntryUseCase.execute(dto);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Get all accounts' })
  async getAccounts(@Query('tenantId') tenantId: string) {
    return this.getAccountsUseCase.execute(tenantId);
  }

  @Get('journal-entries')
  @ApiOperation({ summary: 'Get all journal entries' })
  async getJournalEntries(@Query('tenantId') tenantId: string) {
    return this.getJournalEntriesUseCase.execute(tenantId);
  }
}
