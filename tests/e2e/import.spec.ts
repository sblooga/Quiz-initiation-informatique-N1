import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.on('console', (msg) => console.log('[console]', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.error('[pageerror]', err));
});

test('import csv and start quiz', async ({ page }) => {
  // Go to admin page
  await page.goto('http://localhost:5173/admin');

  // Enter admin code
  await page.getByLabel('Code de sécurité').fill('00000');
  await page.getByRole('button', { name: 'Valider' }).click();

  // Upload CSV
  await page.locator('input[type="file"][accept=".csv"]').setInputFiles('tools/sample-questions.csv');

  // Wait for import to complete
  await expect(page.getByText(/Import réussi/)).toBeVisible({ timeout: 15000 });

  // Go to quiz page
  await page.goto('http://localhost:5173/quiz?profile=TestProfile');

  // Check that a question is visible
  await expect(page.locator('h2')).toHaveCount(1);
});