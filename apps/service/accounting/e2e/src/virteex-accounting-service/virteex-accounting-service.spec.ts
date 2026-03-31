import axios from 'axios';
import { createHmac } from 'crypto';

describe('Accounting Service E2E', () => {
  const tenantId = 'test-tenant-123';
  const hmacSecret = process.env['VIRTEEX_HMAC_SECRET'] || 'test-secret';

  const contextPayload = {
    tenantId,
    userId: 'test-user',
    role: ['admin'],
    permissions: ['*'],
    region: 'US',
    currency: 'USD',
    language: 'en',
    taxJurisdiction: 'US',
    complianceProfile: 'default',
    requestId: 'e2e-test-request',
    provenance: 'e2e-test',
    contextVersion: 'v1',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  const encodedContext = Buffer.from(JSON.stringify(contextPayload)).toString('base64');
  const signature = createHmac('sha256', hmacSecret).update(encodedContext).digest('hex');

  const axiosConfig = {
    baseURL: 'http://localhost:3000',
    headers: {
      'x-tenant-id': tenantId,
      'x-virteex-context': encodedContext,
      'x-virteex-signature': signature,
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
            throw new Error('Should have thrown an error');
        } catch (error: any) {
            if (error.message === 'Should have thrown an error') throw error;
            expect(error.response.status).toBe(400);
        }
      });
  });

  describe('Reports and Closing', () => {
    it('should generate a financial report', async () => {
      const res = await axios.get('/api/accounting/reports/financial?type=BALANCE_SHEET&endDate=' + new Date().toISOString().split('T')[0], axiosConfig);
      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
    });

    it('should close a fiscal period', async () => {
      const closingDate = new Date().toISOString().split('T')[0];
      const res = await axios.post('/api/accounting/closing', { closingDate }, axiosConfig);
      expect(res.status).toBe(201);
    });
  });
});
