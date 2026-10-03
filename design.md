# Dreamers Youth — Design

Version 1.0 · October 2026

---

## Design principles

**Mobile-first.** Leaders use their phones in a youth ministry context — often between conversations, in a noisy room. Every screen must work at 390px (iPhone 14) before it's considered done at desktop.

**One action per screen.** Each page state has one clear primary action. Reduce decision points. Youth ministry volunteers are not power users.

**Minimal chrome.** No sidebar navs, no mega-menus. Leaders see only what's relevant to them. Pastors have more, but it's still structured as simple sections, not a dashboard of dashboards.

**Data entry is fast.** Weekly attendance must be completable in under 2 minutes. Toggle-based inputs (Yes / Maybe / No) instead of text fields wherever possible.

**Instant feedback.** Every save shows a confirmation. Errors are explained in plain language ("That name and phone number already exists — check here").

---

## Visual design

### Colour palette

| Token | Value | Usage |
|---|---|---|
| `--color-brand` | `#7C3AED` (violet-600) | Primary buttons, active states, brand |
| `--color-brand-light` | `#EDE9FE` (violet-100) | Selected states, hover backgrounds |
| `--color-bg` | `#FAFAFA` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, panels |
| `--color-border` | `#E5E7EB` | Dividers, input borders |
| `--color-text` | `#111827` | Body text |
| `--color-text-muted` | `#6B7280` | Secondary labels, metadata |
| `--color-success` | `#059669` | Confirmed saves, active states |
| `--color-warning` | `#D97706` | Absence flags, "Maybe" state |
| `--color-danger` | `#DC2626` | Errors, "No" state, destructive |

Dark mode: `@media (prefers-color-scheme: dark)` swaps `--color-bg` to `#0F0F11`, `--color-surface` to `#1C1C1E`, `--color-border` to `#2C2C2E`, text stays legible.

### Category colours

| Category | Pill colour |
|---|---|
| Contributor | Violet — `#7C3AED` bg, white text |
| Connected | Emerald — `#059669` bg, white text |
| Community | Sky — `#0284C7` bg, white text |
| Archived | Grey — `#9CA3AF` bg, white text |

### Typography

| Scale | Size | Weight | Usage |
|---|---|---|---|
| `--text-xs` | 12px | 400 | Metadata, timestamps |
| `--text-sm` | 14px | 400 | Body, table cells |
| `--text-base` | 16px | 400 | Default |
| `--text-lg` | 18px | 600 | Section headings |
| `--text-xl` | 22px | 700 | Page titles |

Font: system UI stack — `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. No custom font load.

### Spacing

8px base unit. Spacing tokens: `4, 8, 12, 16, 24, 32, 48px`. Padding inside cards: `16px`. Gap between cards: `12px`. Page side gutter: `16px` mobile, `24px` tablet, `auto` centred on desktop (max-width `960px`).

---

## Component patterns

### Header (per page)
```
[Campus name]          [Leader/Pastor name]
[Page title]                    [Role badge]
```
Sticky. Height 56px. Background white/dark. No hamburger menus.

### Tabs (within a page)
Horizontal pill tabs below the header. Active tab has `--color-brand` underline + bold label. On mobile, tabs scroll horizontally if they overflow.

```
[ Roster ]  [ Weekly ]  [ New People ]  [ Term Review ]
                                         ^^^^ hidden until review is open
```

### Youth roster row
```
┌──────────────────────────────────────────────────────┐
│  [Name]              [Category pill]   [Absence flag?] │
│  💧🔥🙌 (filled = yes, outline = no)                 │
└──────────────────────────────────────────────────────┘
```
Tap → expands to show care sheet inline edit. No separate page for editing a single youth.

### Weekly attendance row
```
┌────────────────────────────────────────────────┐
│  [Youth name]    [ Yes ]  [ Maybe ]  [ No ]    │
│                           [reason if ≠ Yes]    │
└────────────────────────────────────────────────┘
```
Toggle buttons — full-width on mobile, 3 buttons per row. Selected state is filled colour (green / amber / red). Reason field appears inline below the row when Maybe or No is selected.

### Care milestone icons
Icons appear as a row below the youth's name. Filled = recorded, outline = not yet:
- 💧 Water baptism
- 🔥 HS baptism
- 🙌 Serving

Tap any icon → inline modal with the checkbox + optional date field. Saves immediately on close.

### NP status pipeline (pastor view)
Horizontal stage labels with count badges:
```
Visit 1 (3)  →  Visit 2 (2)  →  Visit 3 (1)  →  Ready (2)  →  Activated (14)
```
Below: filterable table sorted by stage. Each row is expandable for full record.

### Badge: "pending" assignments
On leader portal home (tab bar), a red count badge appears on "New People" when there are unviewed NP assignments. Cleared when the leader opens that tab.

### Absence flag
Rendered as a small amber strip or icon at the right of the youth row:
```
⚠ 3+ weeks absent
```
Only visible on the roster — not on the weekly entry form. It's a pastoral prompt, not a warning to act on during data entry.

### Term review stats block (read-only, auto-computed)
Displayed as a grid of stat tiles at the top of the term review section:
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  NP Added   │ │  Avg Attend │ │  Expected   │ │  Att. Rate  │
│      4      │ │     7.2     │ │     8.5     │ │    85%      │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
┌─────────────┐ ┌─────────────┐
│  Roster Δ  │ │  NP Connected│
│     +2     │ │   3 of 4    │
└─────────────┘ └─────────────┘
```

### Duplicate warning (NP entry)
When name + phone matches an existing record, a yellow banner appears before save:
```
⚠ This looks like a duplicate.
[Name] [Phone] already exists — added [date].
[ View existing record ]  [ Add anyway ]
```
If pastor confirms duplicate, a side-by-side merge modal appears.

---

## Page-by-page layout notes

### index.html
- Centered card, vertically centered on screen
- Church logo / wordmark top
- Campus select → Leader select cascades (disabled until campus chosen)
- Single large "Enter" button
- Small "New visitor? Scan the QR code" link below

### register.html
- Single scrollable form, no tabs
- Campus name shown at top (pre-selected, not changeable)
- Fields in order: name, phone, school, year level, gender, parent name, parent phone, friend
- Large submit button at bottom
- Success screen replaces form (no redirect) — "Thanks, [name]! See you next week."

### leader.html
- Sticky header with name + campus
- Tab bar below header: Roster | Weekly | New People | (Term Review)
- Each tab section scrolls independently
- FAB (floating action button) only where needed (e.g. "Add NP" on New People tab)

### new-people.html
- Header with campus filter + search
- Pipeline stage summary bar (horizontal scroll on mobile)
- Below: table of records, filtered by stage selection
- "Add NP" button top-right opens a slide-up form
- Row tap → slide-up panel with full record detail + edit

### dashboard.html
- Tab bar: Snapshot | Entry | Term | Setup
- Snapshot: stat tiles grid, then health table (horizontal scroll), then category distribution
- Entry: simple date + form fields, submit
- Term: open/close toggle + collated results table (scrollable, per leader)
- Setup: leader list + manage rosters per leader

---

## Mobile interaction notes

- All tap targets minimum 44×44px
- No hover-dependent interactions — everything works on touch
- Inline expand / collapse preferred over modals where possible
- Modals (when used): slide up from bottom, 90% screen height max, dismissible with swipe down
- Form inputs: native date pickers on mobile, no custom calendar widget
- Scroll: each section scrolls its own content, not the whole page
- "Save" buttons always visible (sticky bottom bar or pinned to bottom of scrollable section)

---

## Empty states

Every list has a designed empty state — not just a blank space:

| Screen | Empty state message |
|---|---|
| Leader roster | "Your roster is empty. Your pastor will add your young people here." |
| Weekly entry | "No youth night this week." (when no-youth-night flag set) |
| New people | "No new people yet this term. Share the QR code at your next youth night." |
| NP pipeline | "No new visitors yet. Generate your campus QR code in Setup." |
| Term review | "No term review is currently open." |

---

## Error handling

- Network errors: "Couldn't save. Check your connection and try again." with a retry button
- Supabase errors: log to console, show generic "Something went wrong" to user
- Validation: inline below the field, not a modal alert
- Required fields: marked with * in label, error on submit attempt only (not while typing)
