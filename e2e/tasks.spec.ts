import { test, expect } from '@playwright/test';

test.describe('Tasks Management', () => {
  const goToAllTasks = async (page: import('@playwright/test').Page) => {
    await page.getByRole('button', { name: 'All Tasks' }).click();
    await expect(page.getByRole('heading', { name: 'Tasks', exact: true })).toBeVisible();
  };

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@taskflow.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should navigate to Tasks view', async ({ page }) => {
    await goToAllTasks(page);
    await expect(page.getByRole('heading', { name: 'Tasks Management' })).toBeVisible();
  });

  test('should display tasks table', async ({ page }) => {
    await goToAllTasks(page);

    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Task' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Project' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Assignee' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Priority' })).toBeVisible();
  });

  test('should filter tasks by search', async ({ page }) => {
    await goToAllTasks(page);
    await page.getByPlaceholder('Search tasks...').fill('update #1');
    await expect(page.getByText('Task operation update #1 for system check')).toBeVisible();
  });

  test('should filter tasks by status', async ({ page }) => {
    await goToAllTasks(page);

    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption('Done');
    const statusCells = page.locator('tbody td').filter({ hasText: 'Done' });
    await expect(statusCells.first()).toBeVisible();
  });

  test('should filter tasks by priority', async ({ page }) => {
    await goToAllTasks(page);

    const prioritySelect = page.locator('select').nth(1);
    await prioritySelect.selectOption('High');
    const priorityCells = page.locator('tbody td').filter({ hasText: 'High' });
    await expect(priorityCells.first()).toBeVisible();
  });

  test('should display priority badges', async ({ page }) => {
    await goToAllTasks(page);

    await expect(
      page.locator('tbody span').filter({ hasText: /Low|Medium|High|Critical/ }).first()
    ).toBeVisible();
  });

  test('should display task status badges', async ({ page }) => {
    await goToAllTasks(page);

    await expect(
      page.locator('tbody span').filter({ hasText: /Todo|In Progress|Done|Planning/ }).first()
    ).toBeVisible();
  });

  test('should display assignee avatars', async ({ page }) => {
    await goToAllTasks(page);

    await expect(page.locator('div.w-8.h-8.rounded-full').first()).toBeVisible();
  });
});
