import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import DataLoader from 'dataloader';
import { GetAccountsByIdsUseCase } from '@virteex/domain-accounting-application';
import { type AccountDto } from '@virteex/domain-accounting-contracts';

@Injectable({ scope: Scope.REQUEST })
export class AccountLoader extends DataLoader<string, AccountDto | null> {
  constructor(
    private readonly getAccountsByIdsUseCase: GetAccountsByIdsUseCase,
    @Inject(REQUEST) private readonly request: {
      tenantContext?: { tenantId: string };
      tenantId?: string;
      raw?: { tenantId: string };
    }
  ) {
    super(async (ids: readonly string[]) => {
      const tenantId = this.request.tenantContext?.tenantId || this.request.tenantId || this.request.raw?.tenantId;
      if (!tenantId) {
        return ids.map(() => null);
      }
      return this.getAccountsByIdsUseCase.execute(tenantId, [...ids]);
    });
  }
}
