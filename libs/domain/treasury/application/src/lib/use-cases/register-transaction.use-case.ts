import { DomainException } from '@virteex/shared-util-server-server-config';
import { Injectable, Inject } from '@nestjs/common';
import { Transaction } from '@virteex/domain-treasury-domain/entities/transaction.entity';
import { TransactionType } from '@virteex/domain-treasury-contracts/enums/transaction-type.enum';
import { TransactionRepository } from '@virteex/domain-treasury-domain/repositories/transaction.repository';
import { BankAccountRepository } from '@virteex/domain-treasury-domain/repositories/bank-account.repository';
import { RegisterTransactionDto } from '@virteex/domain-treasury-contracts/dtos/register-transaction.dto';

@Injectable()
export class RegisterTransactionUseCase {
  constructor(
    @Inject('TRANSACTION_REPOSITORY')
    private readonly transactionRepository: TransactionRepository,
    @Inject('BANK_ACCOUNT_REPOSITORY')
    private readonly bankAccountRepository: BankAccountRepository
  ) {}

  async execute(dto: RegisterTransactionDto): Promise<Transaction> {
    const bankAccount = await this.bankAccountRepository.findById(dto.bankAccountId);
    if (!bankAccount) {
      throw new DomainException('Bank account not found', 'ENTITY_NOT_FOUND');
    }

    const transaction = new Transaction(
      dto.tenantId,
      bankAccount,
      dto.amount,
      dto.type,
      dto.description
    );

    return this.transactionRepository.create(transaction);
  }
}
