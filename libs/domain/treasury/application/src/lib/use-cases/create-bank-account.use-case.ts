import { Inject, Injectable } from '@nestjs/common';
import { BankAccount, BANK_ACCOUNT_REPOSITORY, BankAccountRepository } from '../../../../domain/src/index';
import { CreateBankAccountDto, BankAccountDto } from '../../../../contracts/src/index';

@Injectable()
export class CreateBankAccountUseCase {
  constructor(
    @Inject(BANK_ACCOUNT_REPOSITORY) private bankAccountRepository: BankAccountRepository
  ) {}

  async execute(dto: CreateBankAccountDto): Promise<BankAccountDto> {
    const bankAccount = new BankAccount(dto.tenantId, dto.name, dto.accountNumber, dto.bankName, dto.currency);
    const saved = await this.bankAccountRepository.create(bankAccount);

    // Manual mapping for now
    const response = new BankAccountDto();
    response.id = saved.id;
    response.tenantId = saved.tenantId;
    response.name = saved.name;
    response.accountNumber = saved.accountNumber;
    response.bankName = saved.bankName;
    response.currency = saved.currency;
    response.balance = saved.balance;
    response.createdAt = saved.createdAt;
    response.updatedAt = saved.updatedAt;

    return response;
  }
}
