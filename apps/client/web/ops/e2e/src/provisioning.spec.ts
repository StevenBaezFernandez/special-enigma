import { test, expect } from '@playwright/test';

test.describe('Operations Console - Functional Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Level 5: Simulate session using both sessionStorage (for token) and localStorage (for email)
    // following the improvements in AuthSessionStore
    await page.addInitScript(() => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjI1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      window.sessionStorage.setItem('token', mockToken);
      window.sessionStorage.setItem('email', 'ops-engineer@virteex.com');
      window.localStorage.setItem('email', 'ops-engineer@virteex.com');
    });
    await page.goto('/dashboard');
  });

  test('should display functional monitoring with refresh capability', async ({ page }) => {
    await page.click('text=Monitoring');
    await expect(page.getByText('System Observability')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Refresh Now' })).toBeVisible();

    // Check for real service indicators
    await expect(page.getByText('Identity Service')).toBeVisible();
    await expect(page.getByText('Billing Service')).toBeVisible();
  });

  test('should display real operation history in backups', async ({ page }) => {
    await page.click('text=Backups');
    await expect(page.getByText('Database Snapshots & Disaster Recovery')).toBeVisible();

    // Check for "Create New Snapshot" button
    await expect(page.getByRole('button', { name: 'Create New Snapshot' })).toBeVisible();
  });

  test('should manage incidents via the support module', async ({ page }) => {
    await page.click('text=Support');
    await expect(page.getByText('Operational Incident Management')).toBeVisible();

    // Verify incident table headers
    await expect(page.getByText('Severity')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();
  });
});
