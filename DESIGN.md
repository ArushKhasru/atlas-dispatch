---
name: Atlas Dispatch
description: A clean, practical service desk for confident dispatch decisions.
colors:
  forest: '#174c3c'
  forest-hover: '#103e30'
  ink: '#23342f'
  muted: '#617069'
  canvas: '#f4f6f5'
  surface: '#ffffff'
  line: '#dce3df'
  selected: '#edf4ef'
  selected-outline: '#c4d8c9'
  danger: '#a52e29'
  danger-surface: '#fcf0ed'
  amber: '#80590c'
  warning-surface: '#fbf5e8'
  focus: '#41856b'
typography:
  headline:
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: '30px'
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: '-0.025em'
  title:
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: '24px'
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: '-0.02em'
  body:
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: '14px'
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: '12px'
    fontWeight: 550
rounded:
  field: '5px'
  callout: '6px'
  feedback: '8px'
  capacity: '10px'
  panel: '12px'
spacing:
  compact: '8px'
  field-gap: '12px'
  mobile-gutter: '16px'
  panel-inset: '20px'
  desk-gap: '24px'
components:
  button-primary:
    backgroundColor: '{colors.forest}'
    textColor: '{colors.surface}'
    rounded: '{rounded.field}'
    padding: '10px 13px'
    typography: '{typography.label}'
  button-primary-hover:
    backgroundColor: '{colors.forest-hover}'
  request-panel:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.panel}'
  request-row-selected:
    backgroundColor: '{colors.selected}'
    textColor: '{colors.ink}'
---

# Design System: Atlas Dispatch

## Overview

**Creative North Star: "The Practical Service Desk"**

The user-approved identity is calm, compact and operational. White work surfaces, ruled request rows and one familiar sans family let a coordinator compare evidence and act without decorative interruption. Forest green identifies actions and selection; restrained amber and red communicate uncertainty and urgency.

This document records the implemented system in `src/styles.css` and the reviewed desktop and mobile screenshots. Tailwind supplies layout utilities through `@apply`; `@theme` declares the Atlas forest, ink, line and sans tokens. Semantic component classes retain precise density and state treatment.

Key characteristics:

- Compact information with clear title, state and action hierarchy.
- Flat panels separated by borders and pale surface changes.
- Consistent native inputs, explicit action labels and Lucide outline icons.

## Colors

Forest is the action color. Ink carries primary reading; muted green-gray carries supporting text. The canvas is a cool near-white, with white panels and pale green selection.

Red text and a pale red surface identify overdue work. Amber text and a warm pale surface identify uncertainty. Semantic states also use written labels, so color is never their only signal. The root danger and amber tokens coexist with locally tuned status shades; preserve the role rather than inventing additional categories.

Use the `muted` token for small neutral text and placeholders. It provides approximately 5.21:1 contrast on white. Recheck contrast on tinted surfaces. Keep dividers visibly subordinate to readable text.

## Typography

The entire interface uses Segoe UI with platform and Arial fallbacks. The root is 14px with 1.5 line height; headings use weight 650. No separate display or monospace face is used.

The page heading is 30px, the selected request title 24px, and ordinary section headings 14–16px. Request titles are 14px and semibold. Controls and supporting copy are 11–12px; compact metadata is 9–11px. Original message text uses 14px, 1.7 line height and a maximum measure of 70ch. The clock and request references use tabular numerals.

At mobile width the page heading becomes 26px, detail title 22px and request title 13px. Preserve this fixed scale rather than fluid display typography.

## Layout

The main container is at most 1376px wide with 28px desktop side padding. A 78px top bar holds the brand, fixed clock and utility actions. The capacity strip sits above the work area and uses a 160px heading column followed by three equal technician columns.

The desktop work area uses a slightly wider request queue beside the detail panel, with a 24px gap. The detail panel is sticky at 16px from the top. Queue rows use 20px horizontal padding; the detail panel uses 24px. Thin horizontal rules distinguish evidence, facts and secondary actions.

At 1100px, gaps and insets tighten, capacity headings occupy a separate row, and the assignment form becomes one column. At 760px, the header wraps, outer gutters become 16px and technicians stack. The queue and selected detail occupy the same single-column region; a Back to queue control returns to the list. Below this breakpoint, primary and secondary buttons have a 42px minimum height. At 1500px and above, top and row spacing increases slightly.

## Elevation & Depth

Work panels are flat, with a one-pixel border. Selection uses a pale green fill and inset one-pixel outline. Neither work panel has a drop shadow.

Only transient overlays are elevated: the confirmation toast uses `0 8px 25px #18342125`, and the reset dialog uses `0 20px 80px #14261d30` with a dim backdrop. Keep this distinction between workspace content and temporary interruption.

## Shapes

Queue and detail panels have 12px corners; the capacity strip has 10px corners. Fields and action buttons use 5px corners, callouts 6px and feedback surfaces 8px. Technician identifiers are circular. Borders and aligned rules provide structure; there is no ornamental texture or gradient.

## Components

**Buttons.** Primary actions use forest with white text, 10px by 13px padding and a deeper forest hover. Secondary buttons use a pale green fill and dark green text. Text and icon buttons remain unfilled until hover. Disabled controls reduce opacity to 0.48. Button background and text transitions last 160ms with ease-out.

**Focus and browser surfaces.** Buttons, links and disclosure summaries use a 3px green focus outline with 3px offset. Fields use a 2px outline with 1px offset. Text selection is pale green with dark text; text carets and checkbox accents use forest. Scrollbars are thin with a muted green thumb. Reduced-motion preference removes animations and transitions.

**Fields.** Native selects, datetime inputs and textareas use white surfaces, one-pixel green-gray borders, 5px corners and compact padding. Field labels remain visible above controls. Error messages use a pale warm surface and dark red copy. Search combines an outline icon and borderless input inside a shared bordered container.

**Request rows.** Each full-width row is a button. Reference and customer appear above the request title; channel, received time and owner appear below. A state label sits opposite the reference. Hover is a very pale green, and selection uses the documented green surface and outline. Keep evidence readable rather than replacing content with decorative badges.

**Filters.** Four compact text buttons use a bottom rule for the selected view. The active label is forest and heavier; the row has a shared divider. Preserve clear selected and focus states.

**Technician strip.** A circular identifier, availability label, associated job and optional review arrow form one unit. Availability is written explicitly and supported by a pale green identifier fill.

**Detail and disclosure.** The selected request combines title, state callout, original evidence, owner/visit facts and the next action. Secondary customer drafts, activity and completion use disclosures to limit visible complexity. The reset action uses a native modal dialog because it discards demo changes.

**Feedback.** Saved actions produce a compact dark green toast, with one 200ms clip-and-opacity confirmation animation. No page-load choreography is used.

## Do's and Don'ts

- Do retain the user-approved clean, practical desk identity.
- Do use forest for primary actions and active selection; reserve amber and red for operational meaning.
- Do preserve readable original evidence beside the decision controls.
- Do use explicit state labels, native fields and visible keyboard focus.
- Do keep secondary text readable on its actual background.
- Don't introduce decorative metric cards, display lettering or unrelated color accents.
- Don't add shadows to ordinary work panels or motion unrelated to feedback.
- Don't treat this document as authority to invent business policy or service claims.
