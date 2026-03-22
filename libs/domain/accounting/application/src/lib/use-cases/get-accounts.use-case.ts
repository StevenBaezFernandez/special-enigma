import { type AccountDto } from '@virteex/domain-accounting-contracts';
import { AccountMapper } from '../mappers/account.mapper';
import { type AccountRepository } from '@virteex/domain-accounting-domain';

export class GetAccountsUseCase {
  constructor(
    private accountRepository: AccountRepository
  ) {}

  async execute(tenantId: string): Promise<AccountDto[]> {
    const accounts = await this.accountRepository.findAll(tenantId);
    return accounts.map(AccountMapper.toDto);
  }
}
