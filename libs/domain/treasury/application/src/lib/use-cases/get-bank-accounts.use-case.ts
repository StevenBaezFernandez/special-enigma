import { Inject, Injectable } from '@nestjs/common';
import { BANK_ACCOUNT_REPOSITORY, BankAccountRepository } from '../../../../domain/src/index';
import { BankAccountDto } from '../../../../contracts/src/index';

@Injectable()
export class GetBankAccountsUseCase {
  constructor(
    @Inject(BANK_ACCOUNT_REPOSITORY) private bankAccountRepository: BankAccountRepository
  ) {}

  async execute(tenantId: string): Promise<BankAccountDto[]> {
    const accounts = await this.bankAccountRepository.findAll(tenantId);
    return accounts.map(account => {
      const dto = new BankAccountDto();
      dto.id = account.id;
      dto.tenantId = account.tenantId;
      dto.name = account.name;
      dto.accountNumber = account.accountNumber;
      dto.bankName = account.bankName;
      dto.currency = account.currency;
      dto.balance = account.balance;
      dto.createdAt = account.createdAt;
      dto.updatedAt = account.updatedAt;
      return dto;
    });
  }
}
