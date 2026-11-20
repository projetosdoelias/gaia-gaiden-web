---
name: ui-patterns
description: Gaia Garden visual and UX conventions (gaia-* color tokens, cards, buttons, modals, page states, responsive grids, accessibility, date formatting). Use when creating or changing any page, component, form or modal in gaia-garden-web.
---

# Gaia Garden UI patterns

## Colors: only theme tokens (`src/app/globals.css`)
| Token | Use |
|---|---|
| `gaia-bg` | page background, subtle button background |
| `gaia-darkText` | body text (`/60`, `/70`, `/80` for secondary text) |
| `gaia-greenDeep` | titles, primary buttons, sidebar |
| `gaia-greenMint` | focus rings, accents on dark backgrounds |
| `gaia-greenSignal` | pills/badges (`bg-gaia-greenSignal text-gaia-greenDeep`) |
| `gaia-cardDark` | dark cards |
| `gaia-alert-critical` / `-warning` / `-success` | errors, destructive actions, status |

Never hardcode hex values. Neutral grays (`gray-100/200/400`) are already in use for borders and muted text, and are fine to use.

## Building blocks
- **Page header**: title `text-2xl font-bold text-gaia-greenDeep tracking-tight`, subtitle `text-xs text-gaia-darkText/60`. On mobile the primary action sits below the title (`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2`).
- **Card/panel**: `bg-white rounded-2xl shadow-sm border border-gray-100 p-4` (or `p-6` for state panels).
- **Primary button**: `bg-gaia-greenDeep text-white px-4 py-2 rounded-xl shadow-sm hover:bg-gaia-greenDeep/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed`.
- **Secondary button**: `bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 rounded-xl`.
- **Danger button**: `bg-gaia-alert-critical text-white hover:bg-gaia-alert-critical/90 rounded-xl`.
- **Input/textarea**: `w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gaia-greenMint focus:border-transparent`.
- **Label**: `block text-xs font-medium text-gaia-darkText/70 mb-1`, always with `htmlFor`.
- **Field error**: `text-xs text-gaia-alert-critical`.

## Page states (every data page has all of them)
1. No habitat selected: "Select a habitat…" panel.
2. Loading: **skeletons** in the final layout (`animate-pulse` blocks), not a lone "Loading…" text.
3. Error: message plus a **Retry** button.
4. Empty: a friendly message and a CTA to create the first item.
5. Data.

## Grids of entity cards
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4`.
- Cards are `h-full flex flex-col` so heights stay equal across a row. Truncate titles (`truncate`) and clamp descriptions (`line-clamp-2`).
- If the whole card is clickable, make it a `next/link` with no nested buttons, and give it a visible `focus-visible:ring-2 ring-gaia-greenMint`.
- Reserve media space with a fixed aspect ratio (`aspect-[4/3]`) so images added later cause no layout shift. Use `next/image` once real images exist.
- The grid component takes `items` plus an optional footer slot, ready for a future infinite-scroll sentinel.

## Modals and dialogs
- Overlay `fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm`. Panel `bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-md mx-4 p-6 space-y-4 max-h-[90dvh] overflow-y-auto`.
- Required accessibility: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the title. Escape closes the dialog. Focus moves to the first field on open and returns to the trigger on close.
- Disable the submit button while a request is pending (labels like "Saving…") and prevent double submits.
- Destructive confirmations show the item name and use the danger button.

## Text and data
- New UI text is in **English** (ADR-004). Leave existing pt-BR strings alone unless the task covers them.
- Render user content as plain text (`whitespace-pre-line break-words`). Never use `dangerouslySetInnerHTML`.
- **Dates**:
  - Date-only fields (stage dates): format with `timeZone: "UTC"` to avoid off-by-one errors in America/Sao_Paulo.
  - Timestamps (`createdAt`): format in local time.
  - Keep the formatters in one shared helper.

## Responsiveness checklist
Check at 360, 768, 1024 and 1536px, and with the sidebar open on desktop. There should be no horizontal scroll, and touch targets should be at least ~40px tall.
