import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.on('console', (msg) => console.log('[console]', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.error('[pageerror]', err));
});

test('home page', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.getByText("COURS D'INITIATION INFORMATIQUE N1")).toBeVisible();
});
