import { Injectable, Scope, Inject } from '@nestjs/common';
import DataLoader from 'dataloader';
import { ACCOUNT_REPOSITORY, type AccountRepository, Account } from '@virteex/domain-accounting-domain';

@Injectable({ scope: Scope.REQUEST })
export class AccountLoader extends DataLoader<string, Account | null> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY) private readonly accountRepository: AccountRepository
  ) {
    super(async (ids: readonly string[]) => {
      const accounts = await this.accountRepository.findByIds([...ids]);
      const accountMap = new Map(accounts.map((a) => [a.id, a]));
      return ids.map((id) => accountMap.get(id) || null);
    });
  }
}
