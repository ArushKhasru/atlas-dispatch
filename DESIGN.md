---
name: Atlas Dispatch
description: A practical dark service desk with aligned work panels.
colors:
  canvas: '#0e131a'
  surface: '#171e28'
  raised: '#202a36'
  input: '#111923'
  ink: '#edf2f7'
  muted: '#a8b6c6'
  mint: '#8bd8ba'
  mint-hover: '#a4e5cc'
  on-accent: '#10281f'
  line: '#303a47'
  field-border: '#5a6879'
  selected: '#1b3432'
  selected-border: '#477c6b'
  danger: '#ffaba5'
  danger-surface: '#38272d'
  amber: '#eac77e'
  warning-surface: '#332e24'
typography:
  headline:
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: '30px'
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: '-0.025em'
  body:
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Arial, sans-serif'
    fontSize: '14px'
    fontWeight: 400
    lineHeight: 1.5
rounded:
  control: '7px'
  callout: '8px'
  identifier: '10px'
  panel: '12px'
spacing:
  compact: '8px'
  card-gap: '12px'
  mobile-gutter: '16px'
  desk-gap: '20px'
  panel-inset: '24px'
components:
  button-primary:
    backgroundColor: '{colors.mint}'
    textColor: '{colors.on-accent}'
    rounded: '{rounded.control}'
    padding: '10px 13px'
  button-primary-hover:
    backgroundColor: '{colors.mint-hover}'
  work-panel:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.panel}'
---

# Design System: Atlas Dispatch

## Overview

**Creative North Star: "The Practical Service Desk"**

The user requested a dark version with properly aligned cards. Charcoal and slate surfaces, light ink, restrained mint actions and ruled request rows preserve the clean operational identity. Density serves comparison and dispatch decisions. This document records the implemented `src/styles.css`, including Tailwind `@theme` tokens and semantic classes composed with `@apply`.

## Colors

Canvas, panel, raised and input surfaces provide distinct dark layers. Mint marks primary actions, links, focus and selection accents. Amber means uncertainty; red means urgency or error, always accompanied by explicit text. Neutral borders divide content without competing with labels.

Secondary text has 8.12:1 contrast on the panel and 6.42:1 on selection. Primary button text has 9.39:1 contrast on mint; danger and amber callouts exceed 7:1. Field outlines use the stronger field-border token, providing 3.11:1 against the input surface. Native controls use `color-scheme: dark`.

## Typography

One Segoe UI stack covers every role. Root text is 14px/1.5; headings use weight 650. The page heading is 30px, detail title 25px, request title 15px, and queue heading 16px. Controls are 13px; supporting labels and metadata are chiefly 11–12px. Original messages use 15px/1.7 and a 70ch maximum measure. Clock and references use tabular numerals. Mobile reduces the page heading to 26px, detail title to 22px, request title to 14px and queue metadata to 10px.

## Layout

A 72px header precedes a main container capped at 1376px, with 32px horizontal desktop padding. The heading leads into three equal technician cards, with a shared heading/count row and 12px gaps. Cards have an 82px minimum height and aligned identifier, availability and review-arrow content.

The desktop main uses `height: calc(100dvh - 72px)` and an 820px minimum to retain usable space on short screens. Queue and detail share equal columns, equal height and a 20px gap. The queue keeps heading, filters, search and footnote outside its scrolling list; detail scrolls independently. Both scroll regions have stable gutters and `min-height: 0`. Selecting another request resets the detail scroll. Rows retain natural density with a 104px minimum; they do not stretch to fill the panel.

At 1100px, gutters and card insets tighten, assignment fields stack and metadata can wrap. At 760px, technician cards stack with an 8px gap, page gutters become 16px, and the queue/detail become a natural-height single-pane flow with Back to queue navigation. Internal scrolling is removed on mobile. With guide or storage-warning content visible, desktop main returns to natural height and the work area is 680px tall; mobile overrides this to natural height.

## Elevation & Depth

Ordinary work panels and technician cards are flat, using one-pixel borders. Selection uses a dark green surface and inset outline. Only temporary overlays cast shadows: toast `0 8px 30px #0006`, reset dialog `0 20px 80px #14261d30`. The dialog backdrop is `#070c15bf`.

## Shapes

Panels and technician cards use 12px corners; identifiers use 10px rounded squares; callouts use 8px corners. Primary/secondary buttons and assignment fields use 7px corners. Thin rules and consistent alignment carry structure without ornamental texture.

## Components

**Actions and fields.** Primary mint buttons have dark labels and a lighter hover. Secondary buttons use raised slate with light ink. Both have a 42px minimum height. Assignment controls use the input surface and stronger field borders. Placeholder text uses muted ink. Disabled controls reduce opacity to 0.48.

**Queue and detail.** Each request row is one full-width button with reference, explicit status, title, channel/time and owner. Selected rows use dark green with an inset outline. Filters use mint text and a bottom rule for the active view. The detail keeps original evidence, facts and next action distinct; drafts, completion and activity use disclosures.

**Interaction.** Focus outlines are mint, 3px for buttons/links/summaries and 2px for fields. Queue-row outlines sit inside scroll boundaries. Selection uses mint with dark text; carets and checkbox accents use mint. Thin slate scrollbars remain subordinate. Button color changes last 160ms; the toast uses one 200ms confirmation animation. Reduced-motion preference removes animations and transitions.

## Do's and Don'ts

- Do preserve the dark practical desk, equal technician cards and aligned desktop panels.
- Do keep uncertainty and urgency explicit, with amber/red supporting the words.
- Do maintain contrast on selected, input and status surfaces as well as neutral panels.
- Do retain native controls, visible focus, stable scroll regions and natural mobile flow.
- Don't add decorative metric cards, display lettering, panel shadows or unrelated motion.
- Don't stretch request rows to equalize panel content, or encode business policy in visual documentation.
