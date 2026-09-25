import { test, expect } from '@playwright/test';

test('morning dispatch: link, confirm capacity, assign, draft, reload', async ({ page }) => {
  await page.goto('/');
  const detail = page.getByRole('region', { name: 'Selected request' });
  await expect(page.getByRole('heading', { name: 'Morning dispatch' })).toBeVisible();
  await page.getByRole('button', { name: 'Open R104:', exact: false }).click();
  await expect(detail.getByRole('button', { name: 'Link to R101' })).toBeDisabled();
  await detail.getByRole('checkbox').check();
  await detail.getByRole('button', { name: 'Link to R101' }).click();
  await detail.getByRole('button', { name: 'Open R101', exact: true }).click();
  await expect(
    detail.getByText('Following up on the cold-room fault reported yesterday.'),
  ).toBeVisible();
  await expect(detail.getByLabel('Technician').locator('option[value="T3"]')).toHaveJSProperty(
    'disabled',
    true,
  );
  await page.getByRole('button', { name: 'Review R107 for T3' }).click();
  await expect(detail.getByRole('button', { name: 'Close job & release T3' })).toBeDisabled();
  await detail.getByRole('checkbox').check();
  await detail.getByRole('button', { name: 'Close job & release T3' }).click();
  await page.getByRole('button', { name: 'Open R101:', exact: false }).click();
  await detail.getByLabel('Technician').selectOption('T3');
  await detail.getByLabel('Visit time, Atlas local').fill('2026-10-01T10:00');
  await detail.getByRole('button', { name: 'Assign & set visit' }).click();
  await expect(detail.getByText('Scheduled', { exact: true })).toBeVisible();
  await detail.getByRole('button', { name: 'Prepare a customer update' }).click();
  await expect(detail.getByLabel('Customer update draft')).toHaveValue(
    /T3 is assigned.*1 Oct.*10:00/,
  );
  await page.reload();
  await expect(detail.getByText('Scheduled', { exact: true })).toBeVisible();
  await expect(
    detail.getByText('Following up on the cold-room fault reported yesterday.'),
  ).toBeVisible();
  await detail.getByText('Complete this job', { exact: true }).click();
  await detail.getByRole('checkbox').check();
  await detail.getByRole('button', { name: 'Confirm completion', exact: true }).click();
  await expect(detail.getByRole('heading', { name: 'Completion confirmed' })).toBeVisible();
});

test('ambiguous request requires customer evidence before assignment', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open R105:', exact: false }).click();
  const detail = page.getByRole('region', { name: 'Selected request' });
  await expect(detail.getByRole('button', { name: 'Assign & set visit' })).toHaveCount(0);
  await detail.getByLabel('Equipment or identifier').fill('Pump P-04');
  await detail.getByLabel('Confirmed priority').selectOption('urgent');
  await detail
    .getByLabel('What did the customer confirm?')
    .fill(
      'Synthetic test: customer confirms pump stopped; production affected; isolated by site operator.',
    );
  await detail.getByRole('button', { name: 'Save clarification' }).click();
  await expect(detail.getByRole('button', { name: 'Assign & set visit' })).toBeVisible();
  await detail.getByLabel('Technician').selectOption('T2');
  await detail.getByRole('button', { name: 'Assign & set visit' }).click();
  await expect(
    page.getByRole('region', { name: 'Technician availability' }).getByText('0 of 3 available'),
  ).toBeVisible();
});

test('duplicate can be unlinked without losing either message', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open R104:', exact: false }).click();
  const detail = page.getByRole('region', { name: 'Selected request' });
  await detail.getByRole('checkbox').check();
  await detail.getByRole('button', { name: 'Link to R101' }).click();
  await detail.getByRole('button', { name: 'Undo link' }).click();
  await expect(
    detail.getByText('Following up on the cold-room fault reported yesterday.', { exact: true }),
  ).toBeVisible();
  await expect(detail.getByRole('heading', { name: 'Clarify before dispatch' })).toBeVisible();
  await expect(page.getByText('8 open requests', { exact: false })).toBeVisible();
});

test('search empty state recovers and reset requires confirmation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox').fill('no-such-customer');
  await expect(page.getByRole('heading', { name: 'No matching requests' })).toBeVisible();
  await page.getByRole('button', { name: 'Show all requests' }).click();
  await expect(page.locator('.request-row')).toHaveCount(8);
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Keep my changes' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('mobile uses a readable single-pane workflow without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Request queue' })).toBeVisible();
  await page.getByRole('button', { name: 'Open R101:', exact: false }).click();
  await expect(page.getByRole('region', { name: 'Selected request' })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy();
  await page.getByRole('button', { name: 'Back to queue' }).click();
  await expect(page.getByRole('region', { name: 'Request queue' })).toBeVisible();
});

test('invalid stored state recovers with an honest visible warning', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('atlas-dispatch-v1', JSON.stringify({ version: 99 })),
  );
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Saved data was invalid');
  await expect(page.locator('.request-row')).toHaveCount(8);
});

test('no runtime errors during initial rendering', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Demo guide' }).click();
  await expect(page.getByRole('heading', { name: 'Explicit demo assumptions' })).toBeVisible();
  expect(errors).toEqual([]);
});
