import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditLedgerService } from '../audit-ledger.service';

describe('AuditLedgerService Level 5 Immutable Ledger', () => {
  let service: AuditLedgerService;
  let mockEm: any;
  let mockConn: any;

  beforeEach(() => {
    mockConn = {
      execute: vi.fn(),
    };
    mockEm = {
      getConnection: vi.fn().mockReturnValue(mockConn),
    };
    service = new AuditLedgerService(mockEm as any);
  });

  it('SHOULD create hash-chain when logging operations', async () => {
    mockConn.execute
      .mockResolvedValueOnce([{ hash: 'PREV_HASH' }]) // For ORDER BY DESC LIMIT 1
      .mockResolvedValueOnce({ insertId: 1 }); // For INSERT

    await service.logSensitiveOperation('t1', 'u1', 'DELETE_INVOICE', { id: 'inv1' });

    expect(mockConn.execute).toHaveBeenCalledWith(
      expect.stringContaining('SELECT hash FROM audit_ledger'),
    );

    expect(mockConn.execute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO audit_ledger'),
      expect.arrayContaining(['PREV_HASH', expect.any(String)])
    );

    const insertCall = mockConn.execute.mock.calls[1];
    const currentHash = insertCall[1][5];
    const prevHashInCall = insertCall[1][4];

    expect(prevHashInCall).toBe('PREV_HASH');
    expect(currentHash).toHaveLength(64); // SHA-256 hex
  });

  it('SHOULD use GENESIS for the first entry', async () => {
    mockConn.execute
      .mockResolvedValueOnce([]) // Empty ledger
      .mockResolvedValueOnce({ insertId: 1 });

    await service.logSensitiveOperation('t1', 'u1', 'GENESIS_ACTION', {});

    expect(mockConn.execute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO audit_ledger'),
      expect.arrayContaining(['GENESIS', expect.any(String)])
    );
  });
});
