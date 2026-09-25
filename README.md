# Atlas Dispatch

A small morning dispatch desk for fictional Atlas Industrial Services. It helps a coordinator turn an urgent, unowned request into one job with a technician and an agreed visit time, while preserving the messages behind the decision.

The demo uses the eight supplied assessment requests and a fixed clock: **09:00 on 1 October 2026, Atlas local time**. No real customer data, messages, or integrations are involved.

- [Working product](https://arushkhasru.github.io/atlas-dispatch/)
- [Recorded walkthrough](https://arushkhasru.github.io/atlas-dispatch/demo.html) — captioned, no audio
- [Submission checklist and links](docs/SUBMISSION.md)

## Run locally

Use Node.js 22 LTS and npm. From the repository directory:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://127.0.0.1:5173`. No environment variables or account are required. `.env.example` documents this; you do not need to copy it. Dependencies are pinned in `package-lock.json`.

To build and preview the static production app:

```sh
npm run build
npm run preview
```

Deploy the resulting `dist/` directory to a static host. There is no server component. Relative asset paths support hosting under a repository subdirectory.

## Try the useful path

1. Notice **R101**: cold-room risk is urgent and unowned under an explicit demo policy.
2. Review **R104**, confirm that it is the same fault, and link it to R101. Both original messages remain accessible; the link can be undone.
3. Review **R107** and confirm completion. Closing it releases T3's active-visit capacity.
4. Return to **R101**, choose T3, and save an agreed visit time. Prepare a customer update containing the actual recorded plan.
5. Open **R105** or **R108**. Dispatch requires clarification instead of guessing missing equipment and risk details. R106's update also explicitly says the part arrival and return visit are unconfirmed.

The **Demo guide** explains the assumptions in the app. **Reset demo** restores the eight records after confirmation. **Export demo records** downloads original messages, current state, and activity as JSON; importing is outside this prototype's scope.

## Verify

```sh
npm test
npx playwright install chromium
npm run test:ui
npm run build
```

The unit suite includes 35 checks of dispatch rules and persistence behavior. Seven browser tests exercise the actual workflow, clarification, duplicate undo, mobile navigation, reset, corrupted storage and runtime errors. Both suites passed locally for this submission; GitHub Actions reruns them before deployment. Read the command output for the result of your own run.

Formatting is consistent and repeatable:

```sh
npm run format:check
npm run format
```

## Assumptions and boundaries

- Urgent work needs an owner within **two elapsed hours, including overnight**. This is an illustrative ownership target, not a supplied SLA or a repair deadline.
- Each technician can have one assigned or in-progress visit. A waiting-for-parts job keeps its owner but frees visit capacity. Skills, travel, visit duration, and overlapping calendar slots are not modelled.
- R101's goods-at-risk message starts urgent; R103 starts planned. Ambiguous risk stays unknown. These are editable demo triage judgments. An equipment description is accepted; this does not verify a unique asset identifier.
- Duplicate linking and closure require human confirmation. The R104 suggestion is seeded context, not an AI or general duplicate-detection service.
- Updates are local text drafts. Copying never sends a message.
- Records persist only in this browser's `localStorage`. There is no login, shared backend, cross-device sync, or concurrent-user coordination. Clearing browser data removes changes; export first if needed.
- The clock stays fixed, including activity timestamps. This is not a live scheduler. Intake, routing, billing, parts inventory, and a full job lifecycle are deliberately outside scope.

This prototype demonstrates an operational decision; it does not prove willingness to pay or measured business savings. Before production, validate the ownership target and technician constraints with Atlas, then add authenticated shared storage and server-enforced updates.

## Implementation and submission notes

React, TypeScript, Vite and Tailwind CSS provide the interface; Zod validates state; Vitest and Playwright cover rules and browser behavior. The core modules are `src/domain.ts` (rules), `src/seed.ts` (supplied fictional records), `src/storage.ts` (persistence), and `src/App.tsx` (workflow).

- [Assessment decisions, under 500 words](docs/DECISIONS.md)
- [Demo script, under three minutes](docs/DEMO-SCRIPT.md)
- [How to explain and modify the code](docs/EXPLAINING-THE-CODE.md)

Codex was used substantially for implementation, tests, and documentation. The candidate should review the decisions and code, run the workflow, and be able to explain or modify the submission. The product itself does not call an AI model.
