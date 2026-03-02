import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { BankAccount, CashFlow, Transaction } from '@virteex/domain-treasury-domain';
import { MikroOrmBankAccountRepository } from './repositories/mikro-orm-bank-account.repository';
import { MikroOrmTransactionRepository } from './repositories/mikro-orm-transaction.repository';
import { CsvBankStatementParser } from './parsers/csv-parser';
import { OfxBankStatementParser } from './parsers/ofx-parser';
import { BANK_STATEMENT_PARSER } from '../../../application/src/lib/ports/bank-statement-parser.port';

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
    {
      provide: BANK_STATEMENT_PARSER,
      useClass: CsvBankStatementParser,
      multi: true,
    },
    {
      provide: BANK_STATEMENT_PARSER,
      useClass: OfxBankStatementParser,
      multi: true,
    },
  ],
  exports: ['BANK_ACCOUNT_REPOSITORY', 'TRANSACTION_REPOSITORY', BANK_STATEMENT_PARSER, MikroOrmModule],
})
export class TreasuryInfrastructureModule {}
