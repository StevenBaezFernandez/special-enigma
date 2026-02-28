import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateBankAccountDto, BankAccountDto } from '../../../../contracts/src/index';
import { CreateBankAccountUseCase, GetBankAccountsUseCase, RegisterTransactionUseCase, GetCashFlowUseCase } from '../../../../application/src/index';
import { RegisterTransactionDto, TransactionDto } from '../../../../contracts/src/index';
import { Transaction } from '../../../../domain/src/index';

@ApiTags('Treasury')
@Controller('treasury')
export class TreasuryController {
  constructor(
    private readonly createBankAccountUseCase: CreateBankAccountUseCase,
    private readonly getBankAccountsUseCase: GetBankAccountsUseCase,
    private readonly registerTransactionUseCase: RegisterTransactionUseCase,
    private readonly getCashFlowUseCase: GetCashFlowUseCase
  ) {}

  @Post('bank-accounts')
  @ApiOperation({ summary: 'Create a new bank account' })
  @ApiResponse({ status: 201, type: BankAccountDto })
  async createBankAccount(@Body() dto: CreateBankAccountDto): Promise<BankAccountDto> {
    return this.createBankAccountUseCase.execute(dto);
  }

  @Get('bank-accounts')
  @ApiOperation({ summary: 'Get all bank accounts' })
  @ApiResponse({ status: 200, type: [BankAccountDto] })
  async getBankAccounts(@Query('tenantId') tenantId: string): Promise<BankAccountDto[]> {
    return this.getBankAccountsUseCase.execute(tenantId);
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Register a transaction' })
  @ApiResponse({ status: 201, type: TransactionDto })
  async registerTransaction(@Body() dto: RegisterTransactionDto): Promise<TransactionDto> {
    const entity = await this.registerTransactionUseCase.execute(dto);
    return this.mapToDto(entity);
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Get cash flow (transactions)' })
  @ApiResponse({ status: 200, type: [TransactionDto] })
  async getCashFlow(@Query('tenantId') tenantId: string): Promise<TransactionDto[]> {
    const entities = await this.getCashFlowUseCase.execute(tenantId || 'default');
    return entities.map(e => this.mapToDto(e));
  }

  private mapToDto(entity: Transaction): TransactionDto {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      date: entity.date,
      amount: entity.amount,
      type: entity.type,
      description: entity.description,
      reference: entity.reference,
      bankAccountId: entity.bankAccount.id // Assumes loaded or reference
    };
  }
}
