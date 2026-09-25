# D4. Your decisions

I chose the morning dispatch decision: catch urgent unowned work, reconcile follow-ups, and give one job an owner and an agreed visit time. Atlas could pay for fewer missed assignments and fewer repeated status checks; that is a commercial hypothesis, not a measured outcome.

The workflow prioritizes R101's cold-room risk. A coordinator reviews R104 before linking it to R101; both original messages survive and the link is reversible. Confirming R107's completion releases T3, who can then take R101 with a visit time. Customer drafts reflect the recorded state, including uncertainty. R105 and R108 require clarification before assignment.

The supplied clock is fixed at 09:00 on 1 October 2026. My illustrative target is ownership within two elapsed hours for urgent work, including overnight; it is not an Atlas SLA or a repair deadline. Each technician has one active visit. Waiting for a part retains ownership but frees visit capacity. Skills, travel and duration are not modelled. Cold-room risk starts urgent and routine inspection starts planned; these are editable triage assumptions. Equipment descriptions are accepted without claiming verified asset identifiers.

I deliberately excluded real email/WhatsApp connections, automated diagnosis, AI classification, intake, routing, billing, parts inventory and a complete job lifecycle. Duplicate suggestions are seeded, with human confirmation. This keeps a short demonstration focused on one useful coordination decision.

React, TypeScript and Tailwind CSS provide the interface; domain transitions validate assignments, clarification, links and closure before saving. Zod checks persisted state. Vitest and Playwright provide repeatable checks of rules, persistence and the browser workflow; setup and verification commands are in the README. The demo includes awkward cases: incomplete intake, occupied technicians, duplicate follow-ups and unconfirmed part delivery.

Persistence is browser-local, with JSON export and a reset control. There is no shared backend, login, concurrency control or real message sending. The frozen clock and one-active-visit rule make this a demonstrable prototype, not production scheduling software. Production would require agreed service policies, authenticated shared storage, server-enforced updates and validation with coordinators.

AI use: Codex substantially assisted the implementation, tests and documentation. No AI service runs in the product. I am responsible for reviewing, understanding and explaining the submitted work; AI assistance is disclosed rather than presented as unaided development.
