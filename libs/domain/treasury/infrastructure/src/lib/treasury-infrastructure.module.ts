import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { BankAccount, CashFlow, Transaction } from '@virteex/domain-treasury-domain';
import { MikroOrmBankAccountRepository } from './repositories/mikro-orm-bank-account.repository';
import { MikroOrmTransactionRepository } from './repositories/mikro-orm-transaction.repository';

@Global()
@Module({
  imports: [MikroOrmModule.forFeature([BankAccount, CashFlow, Transaction])],
  providers: [
    {
      provide: 'BANK_ACCOUNT_REPOSITORY',
      useClass: MikroOrmBankAccountRepository,
    },
    {
      provide: 'TRANSACTION_REPOSITORY',
      useClass: MikroOrmTransactionRepository,
    },
  ],
  exports: ['BANK_ACCOUNT_REPOSITORY', 'TRANSACTION_REPOSITORY', MikroOrmModule],
})
export class TreasuryInfrastructureModule {}
