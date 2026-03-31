import { type JournalEntryRepository, type AccountRepository, JournalEntry, JournalEntryLine, JournalEntryStatus, JournalEntryType, Invoice } from '@virteex/domain-accounting-domain';

export class RecordInvoiceUseCase {
  constructor(
    private journalEntryRepository: JournalEntryRepository,
    private accountRepository: AccountRepository
  ) {}

  async execute(tenantId: string, invoice: Invoice, expenseAccountCode: string, payableAccountCode: string): Promise<void> {
    console.log(`[SUBLEDGER] Recording invoice ${invoice.number} for tenant ${tenantId}`);

    const entry = new JournalEntry(tenantId, `Invoice ${invoice.number}`, invoice.issueDate);

    const expenseAccount = await this.accountRepository.findByCode(tenantId, expenseAccountCode);
    const payableAccount = await this.accountRepository.findByCode(tenantId, payableAccountCode);

    if (!expenseAccount || !payableAccount) {
      throw new Error('Expense or Payable account not found');
    }

    entry.addLine(new JournalEntryLine(expenseAccount, invoice.amount, '0.00'));
    entry.addLine(new JournalEntryLine(payableAccount, '0.00', invoice.amount));

    entry.status = JournalEntryStatus.POSTED;
    entry.type = JournalEntryType.NORMAL;
    entry.validateBalance();

    await this.journalEntryRepository.create(entry);
  }
}
