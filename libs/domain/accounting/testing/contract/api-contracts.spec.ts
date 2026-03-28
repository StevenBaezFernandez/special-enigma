import { AccountCreatedEventV1 } from '../../contracts/src/events/v1/account-created.event';

describe('Accounting Domain Contract Validation', () => {
  it('should validate AccountCreatedEventV1 structure', () => {
    const event: AccountCreatedEventV1 = {
      id: '805a5e30-6b66-4e5a-8b82-8438186105a9',
      tenantId: 'tenant-123',
      code: '101.01',
      name: 'Cash and Cash Equivalents',
      createdAt: new Date().toISOString()
    };

    expect(event.id).toBeDefined();
    expect(event.tenantId).toBeDefined();
    expect(event.code).toMatch(/^[0-9.]+$/);
    expect(event.name).toBeDefined();
    expect(Date.parse(event.createdAt)).not.toBeNaN();
  });
});
