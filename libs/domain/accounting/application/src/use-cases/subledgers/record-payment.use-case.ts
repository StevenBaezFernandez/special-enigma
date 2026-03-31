import { type JournalEntryRepository, type AccountRepository, JournalEntry, JournalEntryLine, JournalEntryStatus, JournalEntryType, Payment } from '@virteex/domain-accounting-domain';

export class RecordPaymentUseCase {
  constructor(
    private journalEntryRepository: JournalEntryRepository,
    private accountRepository: AccountRepository
  ) {}

  async execute(tenantId: string, payment: Payment, bankAccountCode: string, receivableAccountCode: string): Promise<void> {
    console.log(`[SUBLEDGER] Recording payment ${payment.reference} for tenant ${tenantId}`);

    const entry = new JournalEntry(tenantId, `Payment ${payment.reference}`, payment.paymentDate);

    const bankAccount = await this.accountRepository.findByCode(tenantId, bankAccountCode);
    const receivableAccount = await this.accountRepository.findByCode(tenantId, receivableAccountCode);

    if (!bankAccount || !receivableAccount) {
      throw new Error('Bank or Receivable account not found');
    }

    entry.addLine(new JournalEntryLine(bankAccount, payment.amount, '0.00'));
    entry.addLine(new JournalEntryLine(receivableAccount, '0.00', payment.amount));

    entry.status = JournalEntryStatus.POSTED;
    entry.type = JournalEntryType.NORMAL;
    entry.validateBalance();

    await this.journalEntryRepository.create(entry);
  }
}
