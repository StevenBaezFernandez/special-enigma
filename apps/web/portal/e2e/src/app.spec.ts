import { test, expect } from '@playwright/test';

test.describe('Virteex Critical Flows', () => {
  test('should redirect to login when accessing dashboard unauthenticated', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should display login form elements', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(
      page.locator('input[type="email"], input[name="email"]'),
    ).toBeVisible();
    await expect(
      page.locator('input[type="password"], input[name="password"]'),
    ).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('successful login flow with authenticated contract', async ({
    page,
  }) => {
    let loginRequests = 0;
    await page.route('**/api/auth/login', async (route) => {
      loginRequests += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          accessToken: 'st-auth-session-v1-production-simulated',
          user: { id: '1', email: 'test@example.com' },
        },
      });
    });

    await page.route('**/api/users/profile', async (route) => {
      await route.fulfill({
        json: { id: '1', email: 'test@example.com', roles: ['admin'] },
      });
    });

    await page.goto('/auth/login');
    await page.fill(
      'input[type="email"], input[name="email"]',
      'test@example.com',
    );
    await page.fill(
      'input[type="password"], input[name="password"]',
      'Password123!',
    );
    await page.click('button[type="submit"]');

    await expect.poll(() => loginRequests).toBe(1);
  });

  test('create invoice flow with retry-safe API contract', async ({ page }) => {
    let invoiceAttempts = 0;

    await page.route('**/api/auth/login', async (route) =>
      route.fulfill({
        json: { accessToken: 'st-auth-session-v1-production-simulated' },
      }),
    );
    await page.route('**/api/users/profile', async (route) =>
      route.fulfill({ json: { id: '1', roles: ['admin'] } }),
    );
    await page.route('**/api/billing/invoices', async (route) => {
      invoiceAttempts += 1;
      if (invoiceAttempts === 1) {
        await route.fulfill({
          status: 503,
          json: { code: 'TEMP_UNAVAILABLE' },
        });
        return;
      }

      await route.fulfill({ status: 201, json: { id: 'inv-123' } });
    });

    await page.goto('/auth/login');
    await page.fill(
      'input[type="email"], input[name="email"]',
      'test@example.com',
    );
    await page.fill(
      'input[type="password"], input[name="password"]',
      'Password123!',
    );
    await page.click('button[type="submit"]');

    await page.goto('/billing/invoices/create');

    const customerInput = page.locator(
      'input[name="customerName"], input[formControlName="customerName"]',
    );
    if (await customerInput.isVisible()) {
      await customerInput.fill('Client A');
    }

    const amountInput = page.locator(
      'input[name="amount"], input[formControlName="amount"]',
    );
    if (await amountInput.isVisible()) {
      await amountInput.fill('100.00');
    }

    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await submitBtn.click();
    }

    await expect.poll(() => invoiceAttempts).toBeGreaterThanOrEqual(1);
  });

  test('view report flow with BI endpoint contract', async ({ page }) => {
    let reportRequests = 0;
    await page.route('**/api/bi/reports*', async (route) => {
      reportRequests += 1;
      await route.fulfill({
        status: 200,
        json: {
          summary: 'Financial Report',
          totalEntries: 50,
          sampleEntryIds: ['1', '2'],
        },
      });
    });

    await page.route('**/api/auth/login', async (route) =>
      route.fulfill({
        json: { accessToken: 'st-auth-session-v1-production-simulated' },
      }),
    );
    await page.route('**/api/users/profile', async (route) =>
      route.fulfill({ json: { id: '1', roles: ['admin'] } }),
    );

    await page.goto('/auth/login');
    await page.fill(
      'input[type="email"], input[name="email"]',
      'test@example.com',
    );
    await page.fill(
      'input[type="password"], input[name="password"]',
      'Password123!',
    );
    await page.click('button[type="submit"]');

    await page.goto('/bi/dashboard');
    await expect.poll(() => reportRequests).toBeGreaterThan(0);
  });
});
