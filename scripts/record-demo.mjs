import { chromium } from '@playwright/test';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';

// Playwright records real browser interactions. Captions explain the decisions;
// no screenshots are substituted for a working workflow.
await mkdir('artifacts', { recursive: true });
await mkdir('.impeccable/review', { recursive: true });
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

  // These recording-only overlays follow real Playwright pointer events.
  // They are never shipped as part of the product interface.
  const style = document.createElement('style');
  style.textContent = `
    * { cursor: none !important; }
    #demo-pointer { position:fixed; left:0; top:0; width:30px; height:36px;
      pointer-events:none; z-index:10003; filter:drop-shadow(0 2px 3px #000b); }
    #demo-pointer-halo { position:fixed; left:0; top:0; width:42px; height:42px;
      border:1px solid #8bd8ba80; border-radius:50%; background:#8bd8ba13;
      pointer-events:none; z-index:10001; }
    .demo-click-ring { position:fixed; width:16px; height:16px; border:3px solid #b9f6dc;
      background:#8bd8ba55; border-radius:50%; pointer-events:none; z-index:10002;
      animation:demo-click .75s ease-out forwards; }
    [data-demo-target] { outline:2px solid #8bd8ba !important; outline-offset:4px !important; }
    @keyframes demo-click { from { transform:translate(-50%,-50%) scale(.7); opacity:1; }
      to { transform:translate(-50%,-50%) scale(3.8); opacity:0; } }
  `;
  document.head.append(style);
  const pointer = document.createElement('div');
  pointer.id = 'demo-pointer';
  pointer.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="36" viewBox="0 0 30 36"><path d="M3 2v26l7-7 6 12 6-3-6-12h10L3 2Z" fill="#fff" stroke="#0e131a" stroke-width="2" stroke-linejoin="round"/></svg>';
  const halo = document.createElement('div');
  halo.id = 'demo-pointer-halo';
  document.body.append(halo, pointer);
  document.addEventListener(
    'pointermove',
    (event) => {
      pointer.style.transform = `translate(${event.clientX - 3}px,${event.clientY - 2}px)`;
      halo.style.transform = `translate(${event.clientX - 21}px,${event.clientY - 21}px)`;
    },
    true,
  );
  document.addEventListener(
    'pointerdown',
    (event) => {
      const ring = document.createElement('div');
      ring.className = 'demo-click-ring';
      ring.style.left = `${event.clientX}px`;
      ring.style.top = `${event.clientY}px`;
      document.body.append(ring);
      ring.addEventListener('animationend', () => ring.remove(), { once: true });
    },
    true,
  );
});
const detail = page.getByRole('region', { name: 'Selected request' });

const startedAt = Date.now();
const actions = [];
let pointer = { x: 44, y: 150 };
await page.mouse.move(pointer.x, pointer.y);

async function pointTo(locator) {
  await locator.scrollIntoViewIfNeeded();
  // Keep the active control above the explanatory caption.
  await locator.evaluate((element) => {
    const box = element.getBoundingClientRect();
    if (box.bottom < innerHeight - 145) return;
    let parent = element.parentElement;
    while (parent && parent !== document.body) {
      if (
        parent.scrollHeight > parent.clientHeight &&
        /auto|scroll/.test(getComputedStyle(parent).overflowY)
      ) {
        parent.scrollBy({ top: box.bottom - (innerHeight - 195), behavior: 'smooth' });
        break;
      }
      parent = parent.parentElement;
    }
  });
  await page.waitForTimeout(350);
  const box = await locator.boundingBox();
  if (!box) throw new Error('Cannot point to an invisible demo control.');
  const target = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const start = { ...pointer };
  for (let step = 1; step <= 24; step++) {
    const t = step / 24;
    const eased = t * t * (3 - 2 * t);
    await page.mouse.move(
      start.x + (target.x - start.x) * eased,
      start.y + (target.y - start.y) * eased,
    );
    await page.waitForTimeout(16);
  }
  pointer = target;
  await locator.evaluate((el) => el.setAttribute('data-demo-target', ''));
  await page.waitForTimeout(220);
}

async function click(locator) {
  await pointTo(locator);
  const label = await locator.evaluate(
    (el) => el.getAttribute('aria-label') || el.textContent || el.tagName,
  );
  actions.push({ atSeconds: (Date.now() - startedAt) / 1000, label: label.trim(), ...pointer });
  await page.mouse.down();
  await page.waitForTimeout(110);
  await page.mouse.up();
  await page.waitForTimeout(250);
  // Capture one genuine frame with both the pointer and click ripple visible.
  if (actions.length === 3)
    await page.screenshot({ path: '.impeccable/review/cursor-preview.png' });
  await page.evaluate(() =>
    document
      .querySelectorAll('[data-demo-target]')
      .forEach((el) => el.removeAttribute('data-demo-target')),
  );
}

async function choose(locator, value) {
  await click(locator);
  const enabled = await locator
    .locator('option')
    .evaluateAll((options) => options.filter((o) => !o.disabled).map((o) => o.value));
  const index = enabled.indexOf(value);
  if (index < 0) throw new Error(`Unavailable option: ${value}`);
  await locator.press('Home');
  for (let i = 0; i < index; i++) {
    await locator.press('ArrowDown');
    await page.waitForTimeout(160);
  }
  await locator.press('Enter');
  if ((await locator.inputValue()) !== value)
    throw new Error(`Selection did not change to ${value}`);
  await page.waitForTimeout(300);
}

async function type(locator, value) {
  await click(locator);
  await locator.press('ControlOrMeta+A');
  await locator.pressSequentially(value, { delay: 22 });
  await page.waitForTimeout(250);
}

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
await click(page.getByRole('button', { name: 'Open R104:', exact: false }));
await caption(
  'Awkward case: R104 may repeat R101. Matching text is only a suggestion; the coordinator must confirm the same fault.',
  8,
);
await click(detail.getByRole('checkbox'));
await click(detail.getByRole('button', { name: 'Link to R101' }));
await caption(
  'Linking removes the extra open job, preserves both original messages, and can be undone.',
  7,
);
await click(detail.getByRole('button', { name: 'Open R101', exact: true }));
await click(page.getByRole('button', { name: 'Review R107 for T3' }));
await caption(
  'T3 is still occupied by R107. A customer saying “it is running” does not silently free the technician.',
  7,
);
await click(detail.getByRole('checkbox'));
await click(detail.getByRole('button', { name: 'Close job & release T3' }));
await caption(
  'After confirming completion with the customer or technician, close the job. T3 is now available.',
  6,
);
await click(page.getByRole('button', { name: 'Open R101:', exact: false }));
await choose(detail.getByLabel('Technician'), 'T3');
await click(detail.getByLabel('Visit time, Atlas local'));
await detail.getByLabel('Visit time, Atlas local').fill('2026-10-01T10:00');
await click(detail.getByRole('button', { name: 'Assign & set visit' }));
await caption(
  'Assign R101 to T3 for an agreed 10:00 visit. Its urgent ownership warning clears; technician capacity updates immediately.',
  8,
);
await click(detail.getByRole('button', { name: 'Prepare a customer update' }));
await detail.getByLabel('Customer update draft').scrollIntoViewIfNeeded();
await caption(
  'The customer draft uses the saved owner and visit time. It is reviewed and copied manually; this demo never sends a message.',
  8,
);
await click(page.getByRole('button', { name: 'Open R105:', exact: false }));
await detail.getByRole('heading', { name: 'Clarify before dispatch' }).scrollIntoViewIfNeeded();
await caption(
  'Another awkward case: “Machine not working” is not enough. Assignment is blocked until equipment and urgency are clarified.',
  8,
);
await type(detail.getByLabel('Equipment or identifier'), 'Pump P-04');
await choose(detail.getByLabel('Confirmed priority'), 'normal');
await type(
  detail.getByLabel('What did the customer confirm?'),
  'Synthetic callback: pump P-04 is stopped; backup is running; no safety concern reported.',
);
await caption(
  'This callback is clearly synthetic demo data. The coordinator records evidence instead of guessing a priority.',
  7,
);
await click(detail.getByRole('button', { name: 'Save clarification' }));
await caption(
  'Saving clarification unlocks assignment. Busy technicians remain unavailable; T2 can take a visit while retaining its parts-waiting job.',
  8,
);
await click(page.getByRole('button', { name: 'Open R106:', exact: false }));
await click(detail.getByRole('button', { name: 'Prepare a customer update' }));
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
await writeFile('.impeccable/review/cursor-recording.json', JSON.stringify(actions, null, 2));
console.log('Recorded walkthrough saved to public/atlas-demo.webm');
