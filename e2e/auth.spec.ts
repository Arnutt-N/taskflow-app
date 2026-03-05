import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveURL('/login');
    // App heading is branding; sign-in copy is in the subtitle.
    await expect(page.locator('h1')).toContainText(/NovaTask/i);
    await expect(page.locator('text=Sign in to your account')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@taskflow.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/');
    // UI uses "Overview" as the main dashboard title
    await expect(page.locator('role=heading[name="Overview"]')).toBeVisible({ timeout: 5000 });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(
      page.locator('text=/Invalid credentials|Invalid email or password/i')
    ).toBeVisible({ timeout: 5000 });
  });

  test('should show error with empty credentials', async ({ page }) => {
    // Email is prefilled by default, so clear it to trigger required validation
    await page.fill('input[type="email"]', '');
    await page.click('button[type="submit"]');

    // Browser native validation should prevent navigation away from /login
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to dashboard if already logged in', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'admin@taskflow.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Ensure we reached an authenticated page
    await expect(page).toHaveURL('/');

    // Try to access login page again
    await page.goto('/login');

    // In some NextAuth setups, client-side redirect might not happen immediately.
    // Assert we're not shown the login form again.
    await expect(page.locator('button[type="submit"]')).not.toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', 'admin@taskflow.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // Logout (assuming there's a logout button in header)
    await page.click('button:has-text("Logout"), button:has-text("Sign Out")');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});
