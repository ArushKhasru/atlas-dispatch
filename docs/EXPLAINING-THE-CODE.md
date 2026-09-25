# Understand the submission before presenting it

Use this as a review guide. Read the code and run the workflow yourself; personalize the decisions and narration so the assessment represents choices you can defend and modify.

## Follow one assignment

1. `src/App.tsx` renders the selected request and technician choices. Busy technicians are unavailable in the select control.
2. Submitting dispatch calls `transition` in `src/domain.ts` with an `assign` action.
3. The domain rule checks that the request can be acted on, a duplicate has been reviewed, equipment and priority are present, the time is valid, and the technician has no other active visit.
4. It clones state, assigns the technician and visit, records an activity entry, and validates the resulting state with Zod.
5. The app saves it through `src/storage.ts` and updates the queue, capacity strip, details and feedback. The customer draft is derived from the updated state.

Checking capacity in the domain function matters even though the UI disables busy options. A disabled option is presentation; the transition is the rule boundary. This still cannot prevent conflicts between separate browsers without a shared server.

## Where each concern lives

| File             | Responsibility                                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/seed.ts`    | The eight supplied fictional messages and original records, plus labelled prototype triage judgments. `createSeed` returns independent copies for reset. |
| `src/domain.ts`  | Types and Zod schemas, fixed clock, queue attention/ranking, active-visit capacity, customer draft text, and validated state transitions.                |
| `src/storage.ts` | Load/save of versioned local storage and warnings when storage is unavailable or invalid.                                                                |
| `src/App.tsx`    | React state, search/filters, request details, confirmation controls, dispatch and clarification forms, reset, export and feedback.                       |
| `src/styles.css` | Tailwind CSS entry point plus visual hierarchy, responsive queue/detail layout, focus states and component styling.                                      |

## Questions to be ready for

**Why this scope?** The assessment asks for the smallest convincing useful solution. The demonstrable outcome is that an urgent job gets an owner and a visit, without creating a duplicate or treating unclear intake as certain.

**Is the urgency classifier intelligent?** No. Initial values and the R104 candidate are seeded, transparent judgments for these eight cases. Unknown stays unknown until a person clarifies it. There is no runtime AI service.

**Why does T2 look available while owning R106?** Waiting for a part keeps the relationship with the customer, but is assumed not to occupy a visit. Assigned and in-progress jobs consume one slot. This deliberately coarse model does not book multiple time slots or calculate visit duration.

**Does “ownership overdue” mean the repair is late?** No. It means an urgent request is unowned at least two elapsed hours after receipt, including overnight under the demo assumption. A visit time in the past has a separate warning. There is no general contractual SLA model.

**Why preserve the original record after changing status?** It distinguishes what the coordinator inherited from subsequent decisions. Linked follow-ups remain their own records. Activity provides useful local context, but is not a tamper-proof audit log.

**Why use UTC arithmetic if this is Atlas local time?** The strings represent fictional wall-clock values. Treating them consistently with UTC parsing and formatting avoids shifting the fixed demo when the reviewer's browser uses another timezone. This is not a production timezone or daylight-saving implementation.

**Is the equipment identifier verified?** No. Known equipment descriptions in the source are sufficient for this prototype's dispatch rule, even when an asset ID remains unconfirmed. R105 and R108 have neither a useful description nor confirmed risk, so they require clarification.

**Can I recover after clearing storage?** The seed returns. Export can preserve JSON beforehand, but the prototype has no import or server backup. Storage warnings mean changes may remain only in the current tab.

**Why no backend?** It keeps setup and review small and eliminates credentials. The tradeoff is material: no shared operational source of truth, authenticated users or conflict prevention across browsers. A production version would need those.

## Small changes worth practising

- Change the ownership target from two to four hours in `ownershipOverdue`, and update the matching UI/help copy and boundary tests. Explain why code and policy text must agree.
- Change a customer's triage through the UI and show the activity trail, capacity and draft after saving.
- Review how `updateDraft` handles unconfirmed visit times and parts delivery. Add wording without implying a message was actually sent.
- Explain why extending technician capacity is more than removing a disabled option: schema invariants, scheduling rules, interface and tests must change together.

Run `npm test`, `npm run test:ui` and `npm run build` after a code change. Tell the reviewer what you actually changed and verified. Acknowledge Codex's substantial assistance clearly; do not claim unaided authorship or checks you have not run.
