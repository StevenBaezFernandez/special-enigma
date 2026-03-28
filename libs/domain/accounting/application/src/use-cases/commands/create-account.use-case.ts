import { Account, AccountType, AccountAlreadyExistsError, ParentAccountNotFoundError, CrossTenantAccessError, type AccountRepository } from '@virteex/domain-accounting-domain';
import { type CreateAccountDto, type AccountDto } from '@virteex/domain-accounting-contracts';
import { AccountMapper } from '../../mappers/account.mapper';

export class CreateAccountUseCase {
  constructor(
    private accountRepository: AccountRepository
  ) {}

  async execute(dto: CreateAccountDto & { tenantId: string }): Promise<AccountDto> {
    const existing = await this.accountRepository.findByCode(dto.tenantId, dto.code);
    if (existing) {
      throw new AccountAlreadyExistsError(dto.code);
    }

    const account = new Account(dto.tenantId, dto.code, dto.name, dto.type as unknown as AccountType);

    if (dto.parentId) {
      const parent = await this.accountRepository.findById(dto.tenantId, dto.parentId);
      if (!parent) {
        throw new ParentAccountNotFoundError(dto.parentId);
      }
      if (parent.tenantId !== dto.tenantId) {
        throw new CrossTenantAccessError();
      }
      account.parent = parent;
      account.level = parent.level + 1;
    }

    const savedAccount = await this.accountRepository.create(account);
    return AccountMapper.toDto(savedAccount);
  }
}
