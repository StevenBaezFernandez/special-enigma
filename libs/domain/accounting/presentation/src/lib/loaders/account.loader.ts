import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import DataLoader from 'dataloader';
import { ACCOUNT_REPOSITORY, type AccountRepository, Account } from '@virteex/domain-accounting-domain';

@Injectable({ scope: Scope.REQUEST })
export class AccountLoader extends DataLoader<string, Account | null> {
  constructor(
    @Inject(ACCOUNT_REPOSITORY) private readonly accountRepository: AccountRepository,
    @Inject(REQUEST) private readonly request: any
  ) {
    super(async (ids: readonly string[]) => {
      const tenantId = this.request.tenantId || this.request.raw?.tenantId;
      if (!tenantId) {
        return ids.map(() => null);
      }
      const accounts = await this.accountRepository.findByIds(tenantId, [...ids]);
      const accountMap = new Map(accounts.map((a) => [a.id, a]));
      return ids.map((id) => accountMap.get(id) || null);
    });
  }
}
