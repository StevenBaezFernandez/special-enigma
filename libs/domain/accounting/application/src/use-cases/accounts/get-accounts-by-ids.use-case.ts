import { type AccountDto } from '@virteex/domain-accounting-contracts';
import { AccountMapper } from '../../mappers/account.mapper';
import { type AccountRepository, type JournalEntryRepository } from '@virteex/domain-accounting-domain';
import { Decimal } from 'decimal.js';

export class GetAccountsByIdsUseCase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly journalEntryRepository: JournalEntryRepository
  ) {}

  async execute(tenantId: string, ids: string[]): Promise<(AccountDto | null)[]> {
    if (ids.length === 0) {
      return [];
    }

    const accounts = await this.accountRepository.findByIds(tenantId, ids);
    const balances = await this.journalEntryRepository.getBalancesByAccount(tenantId, undefined, undefined, undefined, ids);

    const accountMap = new Map(accounts.map((account) => {
      const balance = balances.get(account.id) || { debit: '0', credit: '0' };
      const netBalance = new Decimal(balance.debit).minus(new Decimal(balance.credit)).toNumber();
      return [account.id, AccountMapper.toDto(account, netBalance)];
    }));

    return ids.map(id => accountMap.get(id) || null);
  }
}
