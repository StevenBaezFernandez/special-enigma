import { test, expect } from '@playwright/test';

test.describe('Accounting Flow', () => {
  test('should create a new account', async ({ page }) => {
    // Navigate to accounting
    await page.goto('/es/accounting/chart-of-accounts');

    // Click on create account button (assuming it exists based on the UI component)
    await page.getByRole('button', { name: /Create Account/i }).click();

    // Fill the form
    await page.getByPlaceholder(/e.g. 1100.01/i).fill('1100.E2E');
    await page.getByPlaceholder(/e.g. Petty Cash/i).fill('E2E Test Account');
    await page.selectOption('select[formControlName="type"]', 'ASSET');

    // Submit
    await page.getByRole('button', { name: /Create Account/i }).click();

    // Verify redirect and existence in list
    await expect(page).toHaveURL(/\/accounting\/chart-of-accounts/);
    await expect(page.getByText('1100.E2E')).toBeVisible();
    await expect(page.getByText('E2E Test Account')).toBeVisible();
  });
});
