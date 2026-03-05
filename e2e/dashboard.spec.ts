import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@taskflow.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should display dashboard with KPI cards', async ({ page }) => {
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();

    // Check for KPI cards (current UI)
    await expect(page.locator('text=Total Revenue')).toBeVisible();
    await expect(page.locator('text=Total Cost')).toBeVisible();
    await expect(page.getByText('Net Profit').first()).toBeVisible();
  });

  test('should display project performance chart', async ({ page }) => {
    await expect(page.locator('text=Project Performance')).toBeVisible();
  });

  test('should display operational health chart', async ({ page }) => {
    await expect(page.locator('text=Operational Health')).toBeVisible();
  });

  test('should navigate to Portfolio view', async ({ page }) => {
    await page.getByRole('button', { name: 'Portfolio' }).click();
    await expect(page.getByRole('heading', { name: 'Portfolio' })).toBeVisible();
  });

  test('should navigate to My Tasks view', async ({ page }) => {
    await page.getByRole('button', { name: 'My Tasks' }).click();
    // Current page title is generic "Tasks"
    await expect(page.getByRole('heading', { name: 'Tasks', exact: true })).toBeVisible();
    await expect(page.getByText('• My Tasks')).toBeVisible();
  });

  test('should display sidebar navigation', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Portfolio' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'My Tasks' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'All Tasks' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Import Excel' })).toBeVisible();
  });

  test('should display user info in header', async ({ page }) => {
    await expect(page.locator('text=Admin User')).toBeVisible();
    await expect(page.locator('text=● Admin')).toBeVisible();
  });
});
