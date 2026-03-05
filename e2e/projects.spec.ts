import { test, expect } from '@playwright/test';

test.describe('Projects Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@taskflow.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should navigate to Projects view', async ({ page }) => {
    await page.getByRole('button', { name: 'Portfolio' }).click();
    await expect(page.getByRole('heading', { name: 'Projects Portfolio', exact: true })).toBeVisible();
  });

  test('should display projects cards', async ({ page }) => {
    await page.getByRole('button', { name: 'Portfolio' }).click();

    // In current UI, projects are rendered as cards (buttons)
    await expect(page.getByRole('heading', { name: 'Projects Portfolio', exact: true })).toBeVisible();
    await expect(page.getByRole('button').filter({ hasText: 'Progress' }).first()).toBeVisible();
    await expect(page.locator('text=Progress').first()).toBeVisible();
  });

  test('should display project status badges', async ({ page }) => {
    await page.getByRole('button', { name: 'Portfolio' }).click();

    // Status badge text is derived from project status; ensure at least one is present
    await expect(
      page.locator('span:has-text("Todo"), span:has-text("In Progress"), span:has-text("Done")').first()
    ).toBeVisible();
  });

  test('should display project progress bars', async ({ page }) => {
    await page.getByRole('button', { name: 'Portfolio' }).click();

    // Progress is a div with inline width style in current UI
    await expect(page.locator('div[style*="width:"]').first()).toBeVisible();
  });

  test('should drill down to tasks when selecting a project card', async ({ page }) => {
    await page.getByRole('button', { name: 'Portfolio' }).click();

    // Click a project card (it is a <button>)
    await page.getByRole('button').filter({ hasText: 'Progress' }).first().click();

    // Drill-down navigates to Tasks view
    await expect(page.getByRole('heading', { name: 'Tasks', exact: true })).toBeVisible();
  });

  test('should show "Deadline" info on project cards', async ({ page }) => {
    await page.getByRole('button', { name: 'Portfolio' }).click();
    await expect(page.locator('text=Deadline:').first()).toBeVisible();
  });

  test('should show budget and margin fields on project cards', async ({ page }) => {
    await page.getByRole('button', { name: 'Portfolio' }).click();
    await expect(page.locator('text=Budget').first()).toBeVisible();
    await expect(page.locator('text=Margin').first()).toBeVisible();
  });
});
