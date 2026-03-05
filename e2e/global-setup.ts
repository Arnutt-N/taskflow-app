import { request as playwrightRequest } from '@playwright/test';

async function globalSetup() {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

  const context = await playwrightRequest.newContext({
    baseURL,
  });

  const res = await context.post('/api/test/reset');
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Failed to reset test data: ${res.status()} ${res.statusText()}\n${body}`);
  }

  await context.dispose();
}

export default globalSetup;
