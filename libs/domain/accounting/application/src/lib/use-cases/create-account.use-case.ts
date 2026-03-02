import { Inject, Injectable } from '@nestjs/common';
import { Account, ACCOUNT_REPOSITORY, AccountRepository } from '@virteex/domain-accounting-domain';
import { CreateAccountDto, AccountDto } from '@virteex/domain-accounting-contracts';
import { AccountMapper } from '../mappers/account.mapper';

@Injectable()
export class CreateAccountUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY) private accountRepository: AccountRepository
  ) {}

  async execute(dto: CreateAccountDto): Promise<AccountDto> {
    const existing = await this.accountRepository.findByCode(dto.tenantId, dto.code);
    if (existing) {
      throw new Error(`Account with code ${dto.code} already exists`);
    }

    const account = new Account(dto.tenantId, dto.code, dto.name, dto.type);

    if (dto.parentId) {
      const parent = await this.accountRepository.findById(dto.parentId);
      if (!parent) {
        throw new Error(`Parent account ${dto.parentId} not found`);
      }
      if (parent.tenantId !== dto.tenantId) {
        throw new Error(`Parent account ${dto.parentId} belongs to a different tenant`);
      }
      account.parent = parent;
      account.level = parent.level + 1;
    }

    const savedAccount = await this.accountRepository.create(account);
    return AccountMapper.toDto(savedAccount);
  }
}
