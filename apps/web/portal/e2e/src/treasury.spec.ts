import { test, expect } from '@playwright/test';

test.describe('Treasury Domain', () => {
  test('should navigate to dashboard and list', async ({ page }) => {
    // Navigate to Treasury Dashboard
    // Note: This assumes the user is authenticated or auth is disabled for testing
    await page.goto('/treasury');

    // Expect dashboard title
    await expect(page.locator('h1')).toContainText('Treasury Dashboard');

    // Click List link
    // Angular routerLink usually generates a relative href.
    // Depending on base href, it might be just "list" or "/treasury/list"
    // We'll target the text content to be safe
    await page.click('text=Go to List');

    // Expect List title
    await expect(page.locator('h1')).toContainText('Bank Accounts');

    // Create Account
    await page.fill('input[name="name"]', 'Test Bank');
    await page.fill('input[name="bankName"]', 'Test Bank Inc');
    await page.fill('input[name="accountNumber"]', '1234567890');
    await page.selectOption('select[name="currency"]', 'USD');

    await page.click('button:has-text("Create Account")');

    // Verify it appears in the table
    await expect(page.locator('table')).toContainText('Test Bank');
  });
});
