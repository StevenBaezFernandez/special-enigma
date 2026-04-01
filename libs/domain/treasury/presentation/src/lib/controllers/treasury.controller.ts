import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateBankAccountDto, BankAccountDto } from '@virteex/domain-treasury-contracts';
import { CreateBankAccountUseCase, GetBankAccountsUseCase, RegisterTransactionUseCase, GetCashFlowUseCase } from '@virteex/domain-treasury-application';
import {
  RegisterTransactionDto,
  TransactionDto,
  TransactionType as ContractTransactionType
} from '@virteex/domain-treasury-contracts';
import { Transaction, TransactionType as DomainTransactionType } from '@virteex/domain-treasury-domain';
import { JwtAuthGuard, TenantGuard, CurrentTenant } from '@virteex/kernel-auth';


const DOMAIN_TO_CONTRACT_TYPE: Record<DomainTransactionType, ContractTransactionType> = {
  [DomainTransactionType.CREDIT]: ContractTransactionType.DEPOSIT,
  [DomainTransactionType.DEBIT]: ContractTransactionType.WITHDRAWAL
};

@ApiTags('Treasury')
@Controller('treasury')
@UseGuards(JwtAuthGuard, TenantGuard)
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
  async createBankAccount(@Body() dto: CreateBankAccountDto, @CurrentTenant() tenantId: string): Promise<BankAccountDto> {
    return this.createBankAccountUseCase.execute({ ...dto, tenantId });
  }

  @Get('bank-accounts')
  @ApiOperation({ summary: 'Get all bank accounts' })
  @ApiResponse({ status: 200, type: [BankAccountDto] })
  async getBankAccounts(@CurrentTenant() tenantId: string): Promise<BankAccountDto[]> {
    return this.getBankAccountsUseCase.execute(tenantId);
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Register a transaction' })
  @ApiResponse({ status: 201, type: TransactionDto })
  async registerTransaction(@Body() dto: RegisterTransactionDto, @CurrentTenant() tenantId: string): Promise<TransactionDto> {
    const entity = await this.registerTransactionUseCase.execute({ ...dto, tenantId });
    return this.mapToDto(entity);
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Get cash flow (transactions)' })
  @ApiResponse({ status: 200, type: [TransactionDto] })
  async getCashFlow(@CurrentTenant() tenantId: string): Promise<TransactionDto[]> {
    const entities = await this.getCashFlowUseCase.execute(tenantId);
    return entities.map(e => this.mapToDto(e));
  }

  private mapToDto(entity: Transaction): TransactionDto {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      date: entity.date,
      amount: entity.amount,
      type: DOMAIN_TO_CONTRACT_TYPE[entity.type],
      description: entity.description,
      reference: entity.reference,
      bankAccountId: entity.bankAccount.id // Assumes loaded or reference
    };
  }
}
