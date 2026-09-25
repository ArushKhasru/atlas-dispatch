# Atlas Dispatch development decisions

## Chosen problem

I focused on the morning dispatch decision: identifying urgent requests without an owner and turning them into jobs with a technician and an agreed visit time. This gives the coordinator a clear next action and the operations manager visibility into overdue ownership and technician availability. Fewer missed assignments and repeated status enquiries are the proposed business value; the prototype does not establish savings or willingness to pay.

The demonstration follows R101's cold-room fault. The coordinator reviews and links R104's duplicate follow-up, confirms R107's completion to release T3, and assigns T3 to R101. Linking preserves both original messages and is reversible. Customer update drafts reflect the saved plan and explicitly acknowledge missing information.

## Assumptions

The assessment clock stays at 09:00 on 1 October 2026. I assumed urgent requests need an owner within two elapsed hours, including overnight. This is an illustrative ownership target, not a supplied SLA or repair deadline.

Each technician can have one active visit. Waiting for a part retains job ownership but frees visit capacity. Skills, travel and visit duration are not modelled. R101 starts urgent because goods may be affected; R103 starts planned. These are editable triage judgments. Ambiguous requests such as R105 and R108 require clarification before assignment. Additional callback details in the demonstration are explicitly synthetic.

## Scope and engineering choices

I used React, TypeScript and Tailwind CSS, with browser-local persistence, to keep the prototype easy to run and deploy. Workflow rules are separated from the interface, and Zod validates stored data.

I deliberately excluded real channel integrations, new-request intake, automated diagnosis, AI classification, routing, billing, parts inventory and a complete job lifecycle. Duplicate suggestions are seeded and require human confirmation. Customer updates are drafts; the product sends no messages.

## Verification

All 35 unit tests and seven browser tests passed before deployment. They cover assignment and capacity rules, clarification, reversible duplicate linking, persistence, corrupted storage, reset and mobile navigation. The 2 minute 37 second recorded demonstration shows the workflow working, including incomplete intake and an unconfirmed parts delivery. The production build and public video playback were also verified.

## Limitations

Data stays in one browser, with JSON export and reset controls. There is no authentication, shared backend, cross-device synchronisation or concurrent-user protection. Production would require agreed service policies, authenticated shared storage, server-enforced updates and validation with coordinators.

## AI use

Codex substantially assisted implementation, interface design, testing, documentation and the recorded walkthrough. No AI service runs in the product. This assistance is disclosed; responsibility for understanding, explaining and modifying the submission remains mine.
