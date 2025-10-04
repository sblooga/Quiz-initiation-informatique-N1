import { test, expect } from '@playwright/test';

test('home page', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.getByText('COURS D’INITIATION INFORMATIQUE N1')).toBeVisible();
});
