import { Inject, Injectable } from '@nestjs/common';
import { ACCOUNT_REPOSITORY, AccountRepository } from '@virteex/domain-accounting-domain';
import { AccountDto } from '@virteex/contracts-accounting-contracts';
import { AccountMapper } from '../mappers/account.mapper';

@Injectable()
export class GetAccountsUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY) private accountRepository: AccountRepository
  ) {}

  async execute(tenantId: string): Promise<AccountDto[]> {
    const accounts = await this.accountRepository.findAll(tenantId);
    return accounts.map(AccountMapper.toDto);
  }
}
