import { chromium } from '@playwright/test';
import { mkdir, copyFile } from 'node:fs/promises';

// Playwright records real browser interactions. Captions explain the decisions;
// no screenshots are substituted for a working workflow.
await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  recordVideo: { dir: 'artifacts', size: { width: 1440, height: 1000 } },
});
const page = await context.newPage();
await page.goto(process.env.DEMO_URL || 'http://127.0.0.1:5173');
await page.evaluate(() => {
  const caption = document.createElement('div');
  caption.id = 'walkthrough-caption';
  caption.style.cssText =
    'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:10000;width:calc(100% - 64px);max-width:1120px;background:#173c2b;color:white;padding:16px 24px;border-radius:9px;font:500 19px/1.5 Segoe UI,sans-serif;box-shadow:0 8px 30px #0003;text-align:center;pointer-events:none';
  document.body.append(caption);
});
const detail = page.getByRole('region', { name: 'Selected request' });
async function caption(text, seconds = 7) {
  await page.evaluate((t) => {
    document.querySelector('#walkthrough-caption').textContent = t;
  }, text);
  await page.waitForTimeout(seconds * 1000);
}
await caption(
  'Atlas Dispatch • One morning decision: catch urgent unowned work and give the next job a plan.',
  8,
);
await caption(
  'The assessment clock is fixed at 09:00 on 1 October. R101 is overdue under an explicit demo policy: urgent ownership within 2 elapsed hours.',
  9,
);
await page.getByRole('button', { name: 'Open R104:', exact: false }).click();
await caption(
  'Awkward case: R104 may repeat R101. Matching text is only a suggestion; the coordinator must confirm the same fault.',
  8,
);
await detail.getByRole('checkbox').check();
await detail.getByRole('button', { name: 'Link to R101' }).click();
await caption(
  'Linking removes the extra open job, preserves both original messages, and can be undone.',
  7,
);
await detail.getByRole('button', { name: 'Open R101', exact: true }).click();
await page.getByRole('button', { name: 'Review R107 for T3' }).click();
await caption(
  'T3 is still occupied by R107. A customer saying “it is running” does not silently free the technician.',
  7,
);
await detail.getByRole('checkbox').check();
await detail.getByRole('button', { name: 'Close job & release T3' }).click();
await caption(
  'After confirming completion with the customer or technician, close the job. T3 is now available.',
  6,
);
await page.getByRole('button', { name: 'Open R101:', exact: false }).click();
await detail.getByLabel('Technician').selectOption('T3');
await detail.getByLabel('Visit time, Atlas local').fill('2026-10-01T10:00');
await detail.getByRole('button', { name: 'Assign & set visit' }).click();
await caption(
  'Assign R101 to T3 for an agreed 10:00 visit. Its urgent ownership warning clears; technician capacity updates immediately.',
  8,
);
await detail.getByRole('button', { name: 'Prepare a customer update' }).click();
await detail.getByLabel('Customer update draft').scrollIntoViewIfNeeded();
await caption(
  'The customer draft uses the saved owner and visit time. It is reviewed and copied manually; this demo never sends a message.',
  8,
);
await page.getByRole('button', { name: 'Open R105:', exact: false }).click();
await detail.getByRole('heading', { name: 'Clarify before dispatch' }).scrollIntoViewIfNeeded();
await caption(
  'Another awkward case: “Machine not working” is not enough. Assignment is blocked until equipment and urgency are clarified.',
  8,
);
await detail.getByLabel('Equipment or identifier').fill('Pump P-04');
await detail.getByLabel('Confirmed priority').selectOption('normal');
await detail
  .getByLabel('What did the customer confirm?')
  .fill('Synthetic callback: pump P-04 is stopped; backup is running; no safety concern reported.');
await caption(
  'This callback is clearly synthetic demo data. The coordinator records evidence instead of guessing a priority.',
  7,
);
await detail.getByRole('button', { name: 'Save clarification' }).click();
await caption(
  'Saving clarification unlocks assignment. Busy technicians remain unavailable; T2 can take a visit while retaining its parts-waiting job.',
  8,
);
await page.getByRole('button', { name: 'Open R106:', exact: false }).click();
await detail.getByRole('button', { name: 'Prepare a customer update' }).click();
await detail.getByLabel('Customer update draft').scrollIntoViewIfNeeded();
await caption(
  'R106 has no confirmed part delivery or return visit. Its draft says so. No invented ETA, no false promise.',
  8,
);
await page.evaluate(() => window.scrollTo(0, 0));
await caption(
  'Small scope: a working dispatch decision, original evidence, explicit assumptions and browser-local persistence. No integrations or production scheduling claims.',
  8,
);
await caption(
  'React • TypeScript • Tailwind CSS. Source, tests, setup and AI-use disclosure are included in the repository.',
  6,
);
const video = page.video();
await context.close();
await copyFile(await video.path(), 'public/atlas-demo.webm');
await browser.close();
console.log('Recorded walkthrough saved to public/atlas-demo.webm');
