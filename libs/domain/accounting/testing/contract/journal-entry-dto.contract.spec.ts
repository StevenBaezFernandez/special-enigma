import { JournalEntryMapper } from '@virteex/domain-accounting-application';
import { JournalEntry, JournalEntryStatus, JournalEntryType } from '@virteex/domain-accounting-domain';

describe('JournalEntryDtoContract', () => {
  it('should guarantee that amount is present and calculated correctly from lines in toDto', () => {
    const mockAccount = { id: 'acc-1' } as any;
    const entity: JournalEntry = {
      id: 'je-1',
      tenantId: 'tenant-1',
      date: new Date(),
      description: 'Test entry',
      status: JournalEntryStatus.POSTED,
      type: JournalEntryType.MANUAL,
      reference: 'REF-001',
      lines: [
        { id: 'l1', account: mockAccount, debit: '100.50', credit: '0', description: 'Debit line' },
        { id: 'l2', account: mockAccount, debit: '0', credit: '100.50', description: 'Credit line' },
      ],
    } as any;

    const dto = JournalEntryMapper.toDto(entity);

    expect(dto).toHaveProperty('amount');
    expect(dto.amount).toBe(100.50);
    expect(typeof dto.amount).toBe('number');
  });

  it('should handle zero lines by returning amount 0', () => {
    const entity: JournalEntry = {
        id: 'je-2',
        tenantId: 'tenant-1',
        date: new Date(),
        description: 'Empty entry',
        status: JournalEntryStatus.DRAFT,
        type: JournalEntryType.MANUAL,
        lines: [],
    } as any;

    const dto = JournalEntryMapper.toDto(entity);

    expect(dto.amount).toBe(0);
  });
});
