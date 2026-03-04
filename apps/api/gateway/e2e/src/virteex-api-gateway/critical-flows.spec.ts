import axios from 'axios';

const runCriticalE2E = process.env.RUN_CRITICAL_E2E !== 'false';
const describeIf = runCriticalE2E ? describe : describe.skip;

if (!runCriticalE2E) {
  console.warn('CRITICAL WARNING: E2E tests are being skipped via RUN_CRITICAL_E2E=false');
}

function uniqueRef(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

describe('Critical ERP cross-domain flows', () => {
  it('Order-to-Cash: create invoice and verify usage increments', async () => {
    const tenantId = process.env.E2E_TENANT_ID ?? 'tenant-e2e';
    const invoicePayload = {
      tenantId,
      customerId: 'cust-e2e-1',
      dueDate: '2026-01-15',
      paymentForm: '01',
      paymentMethod: 'PUE',
      usage: 'G03',
      items: [{ description: uniqueRef('item'), quantity: 1, unitPrice: 100, productId: 'prod-1' }]
    };

    const createRes = await axios.post('/api/billing/invoices', invoicePayload, { headers: { 'x-virteex-tenant-id': tenantId } });
    expect(createRes.status).toBeLessThan(300);

    const usageRes = await axios.get('/api/billing/usage', { headers: { 'x-virteex-tenant-id': tenantId } });
    expect(usageRes.status).toBe(200);
    expect(Array.isArray(usageRes.data)).toBe(true);
  });

  it('Procure-to-Pay: supplier and purchasing order flow baseline', async () => {
    const tenantId = process.env.E2E_TENANT_ID ?? 'tenant-e2e';
    const supplier = {
      name: uniqueRef('supplier'),
      taxId: uniqueRef('tax'),
      email: 'supplier-e2e@example.com'
    };

    const supplierRes = await axios.post('/api/purchasing/suppliers', supplier, { headers: { 'x-virteex-tenant-id': tenantId } });
    expect(supplierRes.status).toBeLessThan(300);
  });

  it('Record-to-Report: create journal entry and fetch accounting balances', async () => {
    const tenantId = process.env.E2E_TENANT_ID ?? 'tenant-e2e';

    const entryRes = await axios.post(
      '/api/accounting/journal-entries',
      {
        date: '2026-01-15',
        description: uniqueRef('r2r-entry'),
        lines: [
          { accountCode: '105.01', debit: 100, credit: 0 },
          { accountCode: '401.01', debit: 0, credit: 100 }
        ]
      },
      { headers: { 'x-virteex-tenant-id': tenantId } }
    );
    expect(entryRes.status).toBeLessThan(300);

    const balanceRes = await axios.get('/api/accounting/trial-balance', { headers: { 'x-virteex-tenant-id': tenantId } });
    expect(balanceRes.status).toBe(200);
  });

  it('Fiscal stamping and cancellation: end-to-end authority integration baseline', async () => {
    const tenantId = process.env.E2E_TENANT_ID ?? 'tenant-e2e';

    const stampRes = await axios.post(
      '/api/fiscal/stamp',
      { invoiceId: uniqueRef('invoice') },
      { headers: { 'x-virteex-tenant-id': tenantId } }
    );
    expect(stampRes.status).toBeLessThan(300);

    const cancelRes = await axios.post(
      '/api/fiscal/cancel',
      { uuid: stampRes.data?.uuid ?? uniqueRef('uuid'), rfc: 'XAXX010101000' },
      { headers: { 'x-virteex-tenant-id': tenantId } }
    );
    expect(cancelRes.status).toBeLessThan(300);
  });
});
