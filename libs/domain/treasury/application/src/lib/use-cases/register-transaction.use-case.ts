import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Transaction } from '../../../../domain/src/lib/entities/transaction.entity';
import { TransactionType } from '../../../../contracts/src/lib/enums/transaction-type.enum';
import { TransactionRepository } from '../../../../domain/src/lib/repositories/transaction.repository';
import { BankAccountRepository } from '../../../../domain/src/lib/repositories/bank-account.repository';
import { RegisterTransactionDto } from '../../../../contracts/src/lib/dtos/register-transaction.dto';

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
      throw new NotFoundException('Bank account not found');
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
