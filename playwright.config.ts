import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  globalSetup: './e2e/global-setup.ts',
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000,
  },

  // Stability over speed for E2E
  // (If you want it faster later, we can re-enable and tune.)
  fullyParallel: false,
  workers: process.env.CI ? 1 : undefined,

  retries: process.env.CI ? 2 : 0,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // More stable click/typing behavior
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Force a stable port for Playwright runs so it doesn't collide with dev servers
    // Also isolate persisted JSON data per run to avoid state bleeding/flakiness.
    command: 'PORT=3000 PLAYWRIGHT=1 TASKFLOW_DATA_DIR=.playwright-data npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
});
