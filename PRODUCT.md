# Atlas Dispatch

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated by user: React, TypeScript and Vite. Browser-local persistence; no server, credentials, or paid services.

## Users

Atlas's service coordinator and operations manager. Atlas is a fictional 35-person commercial equipment maintenance business.

## Product Purpose

Make the morning dispatch decision: identify urgent unowned work, reconcile follow-ups, and assign a technician with a visit time.

## Operating Context

Requests arrive via email, WhatsApp and phone and are manually copied into a spreadsheet. Assessment clock: 09:00 on 1 October 2026, Atlas local time. Supplied technicians: T1, T2, T3. Preserve all eight supplied request messages and original records.

## Capabilities and Constraints

Chosen scope (implementation assumption): triage queue, manual duplicate linking, technician workload, visit scheduling, explicit clarification and closure, and customer update drafts. No real integrations or real customer data. Do not assert skills, capacity or service targets as supplied facts. Proposed demo assumptions: one active visit per technician, waiting-for-parts jobs do not occupy an active visit, urgent requests need ownership within two elapsed hours. Human confirmation is required before duplicates are linked or completed jobs closed. Show local persistence and fixed clock clearly.

## Evidence on Hand

Eight fictional requests R101–R108 supplied in the assessment. No commercial outcomes or clients may be invented. User authorized publishing through connected GitHub and available hosting.

## Product Principles

- Show the original evidence beside the next action.
- Keep uncertainty visible; no automatic diagnosis or duplicate merging.
- Preserve linked messages and record changes.
- A coordinator must be able to demonstrate the workflow in under three minutes.

## Open decisions

User approved a clean, practical dispatch desk with a prioritized request list beside the selected job and always-visible technician availability. Hosting discovery remains open. No paid services authorized.
