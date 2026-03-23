import axios from 'axios';

describe('Accounting Service E2E', () => {
  const tenantId = 'test-tenant-123';
  const axiosConfig = {
    headers: {
      'x-tenant-id': tenantId,
    },
  };

  describe('Account Management', () => {
    it('should create a new account', async () => {
      const createAccountDto = {
        code: '101.01',
        name: 'Cash in Bank',
        type: 'ASSET',
      };

      const res = await axios.post('/api/accounting/accounts', createAccountDto, axiosConfig);

      expect(res.status).toBe(201);
      expect(res.data.code).toBe('101.01');
      expect(res.data.name).toBe('Cash in Bank');
    });

    it('should get all accounts for a tenant', async () => {
      const res = await axios.get('/api/accounting/accounts', axiosConfig);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.some((a: any) => a.code === '101.01')).toBe(true);
    });
  });

  describe('Journal Entries', () => {
    let account1Id: string;
    let account2Id: string;

    beforeAll(async () => {
        const acc1 = await axios.post('/api/accounting/accounts', {
            code: '101.02',
            name: 'Cash',
            type: 'ASSET'
        }, axiosConfig);
        account1Id = acc1.data.id;

        const acc2 = await axios.post('/api/accounting/accounts', {
            code: '401.01',
            name: 'Sales',
            type: 'REVENUE'
        }, axiosConfig);
        account2Id = acc2.data.id;
    });

    it('should record a balanced journal entry', async () => {
      const recordEntryDto = {
        date: new Date().toISOString(),
        description: 'Test Sales Entry',
        lines: [
          { accountId: account1Id, debit: '100.00', credit: '0.00', description: 'Debit cash' },
          { accountId: account2Id, debit: '0.00', credit: '100.00', description: 'Credit sales' },
        ],
      };

      const res = await axios.post('/api/accounting/journal-entries', recordEntryDto, axiosConfig);

      expect(res.status).toBe(201);
      expect(res.data.description).toBe('Test Sales Entry');
    });

    it('should fail to record an unbalanced journal entry', async () => {
        const recordEntryDto = {
          date: new Date().toISOString(),
          description: 'Unbalanced Entry',
          lines: [
            { accountId: account1Id, debit: '100.00', credit: '0.00', description: 'Debit cash' },
            { accountId: account2Id, debit: '0.00', credit: '50.00', description: 'Credit sales' },
          ],
        };

        try {
            await axios.post('/api/accounting/journal-entries', recordEntryDto, axiosConfig);
            expect.fail('Should have thrown an error');
        } catch (error: any) {
            expect(error.response.status).toBe(400);
        }
      });
  });
});
