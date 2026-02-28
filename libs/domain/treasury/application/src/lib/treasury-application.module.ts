import { Module } from '@nestjs/common';
import { CreateBankAccountUseCase } from './use-cases/create-bank-account.use-case';
import { GetBankAccountsUseCase } from './use-cases/get-bank-accounts.use-case';
import { RegisterTransactionUseCase } from './use-cases/register-transaction.use-case';
import { GetCashFlowUseCase } from './use-cases/get-cash-flow.use-case';
import { TreasuryInfrastructureModule } from '../../../infrastructure/src/index';

@Module({
  imports: [TreasuryInfrastructureModule],
  providers: [
    CreateBankAccountUseCase,
    GetBankAccountsUseCase,
    RegisterTransactionUseCase,
    GetCashFlowUseCase
  ],
  exports: [
    CreateBankAccountUseCase,
    GetBankAccountsUseCase,
    RegisterTransactionUseCase,
    GetCashFlowUseCase
  ],
})
export class TreasuryApplicationModule {}
