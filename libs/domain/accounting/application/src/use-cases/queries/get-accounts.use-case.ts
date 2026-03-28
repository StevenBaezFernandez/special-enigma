import { type AccountDto } from '@virteex/domain-accounting-contracts';
import { AccountMapper } from '../../mappers/account.mapper';
import { type AccountRepository, type JournalEntryRepository } from '@virteex/domain-accounting-domain';
import { Decimal } from 'decimal.js';

export class GetAccountsUseCase {
  constructor(
    private accountRepository: AccountRepository,
    private journalEntryRepository: JournalEntryRepository
  ) {}

  async execute(tenantId: string): Promise<AccountDto[]> {
    const accounts = await this.accountRepository.findAll(tenantId);
    const balances = await this.journalEntryRepository.getBalancesByAccount(tenantId);

    return accounts.map(account => {
      const balance = balances.get(account.id) || { debit: '0', credit: '0' };
      const netBalance = new Decimal(balance.debit).minus(new Decimal(balance.credit)).toNumber();
      return AccountMapper.toDto(account, netBalance);
    });
  }
}
