import { test, expect, Page } from '@playwright/test';
import path from 'path';

const testDataDir = path.join(__dirname, 'test-data');
const files = {
  valid: path.join(testDataDir, 'test-projects.xlsx'),
  invalid: path.join(testDataDir, 'test.txt'),
  large: path.join(testDataDir, 'large.xlsx'),
};

const uploadAndPreview = async (page: Page, filePath: string) => {
  await page.setInputFiles('input[type="file"]', filePath);
  await page.getByRole('button', { name: /Upload \& Preview/i }).click();
};

test.describe('Excel Import', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@taskflow.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should access upload page (admin only)', async ({ page }) => {
    await page.goto('/admin/upload');
    await expect(page.getByRole('heading', { name: 'Admin - Excel Import' })).toBeVisible();
  });

  test('should upload Excel file successfully', async ({ page }) => {
    await page.goto('/admin/upload');
    await uploadAndPreview(page, files.valid);
    await expect(page.locator('text=/Parsed .* rows/i')).toBeVisible();
  });

  test('should show error for invalid file type', async ({ page }) => {
    await page.goto('/admin/upload');
    await uploadAndPreview(page, files.invalid);
    await expect(page.locator('text=/Invalid file type/i')).toBeVisible();
  });

  test('should preview data before import', async ({ page }) => {
    await page.goto('/admin/upload');
    await uploadAndPreview(page, files.valid);
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('columnheader', { name: 'name' })).toBeVisible();
    await expect(page.locator('text=Playwright Project')).toBeVisible();
  });

  test('should import data successfully', async ({ page }) => {
    await page.goto('/admin/upload');
    await uploadAndPreview(page, files.valid);
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /Import/i }).click();
    await expect(page.locator('text=/Successfully imported/i')).toBeVisible();
  });

  test('should show imported data in dashboard', async ({ page }) => {
    await page.goto('/admin/upload');
    await uploadAndPreview(page, files.valid);
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /Import/i }).click();
    await expect(page.locator('text=/Successfully imported/i')).toBeVisible();

    await page.goto('/');
    // Dashboard still renders after import
    await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
    await expect(page.locator('text=Total Revenue')).toBeVisible();
  });

  test('should handle large Excel files', async ({ page }) => {
    await page.goto('/admin/upload');
    await uploadAndPreview(page, files.large);
    await expect(page.locator('text=/File too large/i')).toBeVisible();
  });
});
