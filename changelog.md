# Dreamers Youth — Changelog

---

## v0.1.0 — Foundation
**Date:** 3 October 2026
**Status:** Infrastructure + shared layer complete. App not yet functional end-to-end.

### What was built

#### Database (Supabase)
- All 9 tables created and live on Supabase project `dfozyykukmwcskacqyhq`
- Tables: `campuses`, `leaders`, `youth_roster`, `new_people`, `new_christians`, `leader_entries`, `weekly_stats`, `term_reviews`, `faith_goals`
- 7 campuses seeded: City, Clare, Copper Coast, Mount Barker, Paradise, Salisbury, South
- RLS not enabled (V1 decision — trusted internal staff only; revisit in V2)

#### Files created
| File | Purpose |
|---|---|
| `schema.sql` | Full Supabase schema — source of truth for all 9 tables |
| `shared.js` | Supabase client, identity management (`getIdentity`, `setIdentity`, `requireIdentity`), date/term helpers, attendance stats computation, absence flag logic, Planning Centre stub for V2 |
| `shared.css` | Complete design token system + component library (cards, buttons, forms, tabs, badges, modals, stat tiles, care icons, toggle groups, tables, empty states) |
| `index.html` | Entry point — campus dropdown, leader name dropdown (filtered by campus), sessionStorage identity, routes leader → `leader.html`, pastor → `dashboard.html` |

#### Supabase configuration
- Project URL: `https://dfozyykukmwcskacqyhq.supabase.co`
- Auth: publishable anon key configured in `shared.js`
- Stack: browser → Supabase REST direct (no server layer)

### Known issues / to address
- `campuses` table: `name` and `slug` columns appear to have swapped values (names are lowercase e.g. `city`, slugs are capitalised e.g. `City`). Should be: name = display name (e.g. `City`), slug = URL-safe lowercase (e.g. `city`). Fix before QR codes are generated.

### All V1 pages complete
All 6 HTML pages built and connected to Supabase.

---

---

## v0.2.0 — All Pages Built
**Date:** 3 October 2026
**Status:** Full V1 feature set complete. Ready for Netlify deploy + pilot testing.

### What was built

#### register.html
- Public QR registration form (no login required)
- Campus pre-selected from `?campus=slug` URL param
- Fields: name, phone, school, year level, gender, parent details, who brought them
- Duplicate check on name + phone — shows warning but allows submit
- Submits to `new_people` table with `status = 'visit_1'`
- Success screen on submit

#### leader.html
- Identity-protected (leader role only)
- **#roster tab:** full youth roster with category badges, care icons (💧🔥🙌), absence flag (3+ consecutive no), tap-to-expand care sheet editor, auto-Contributor on serving toggle
- **#weekly tab:** youth night date selector (defaults to most recent Friday), Yes/Maybe/No toggle per youth with reason field, UPSERT to `leader_entries`, suppressed when pastor marks no youth night
- **#new-people tab:** list of assigned NPs with visit dots and contact/catch-up checkboxes, new-assigned badge count, manual add modal with duplicate check
- **#term-review tab:** hidden until pastor opens term review — auto-stats banner, category + comment per youth, connection status per NP, step checkboxes per NC, submit locks form

#### new-people.html
- Pastor-only NP pipeline CRM
- Status filter bar (All / Visit 1 / V2 / V3 / Ready / Activated / Archived)
- Table view with click-to-edit detail modal
- Full field editing: visits, leader assignment, status, NC fields
- Activate button (after visit 3) → creates `youth_roster` record, updates NP status
- Archive with reason
- Add modal with duplicate detection and link to existing record
- NC fields on NP record when `is_new_christian = true`

#### new-christians.html
- Pastor-only NC discipleship pathway for roster youth (not in NP pipeline)
- Card list with step progress (baptism, bible, Fresh Start started/completed)
- Add: search roster by name → select youth → enter decision details
- Edit modal: all NC step fields + leader assignment
- Archive

#### dashboard.html
- Pastor-only control centre with 4 tabs:
- **Weekly Entry:** all campus life metrics form, no-youth-night toggle, UPSERT to `weekly_stats`
- **Snapshot:** leader submission status this week, category distribution bar per leader, discipleship milestones, year/gender breakdown, scrollable health stats table (last 8 weeks)
- **Term:** open/close term review button, real-time leader submission status, collated category summary
- **Setup:** campus QR code generator (downloadable PNG), add/deactivate leaders, build/edit youth rosters per leader

### Campuses fixed
- `name` / `slug` columns corrected (names are now display-ready, slugs are lowercase)
- Mount Barker display name fixed

### Known issues / to address before pilot
- Youth night day hardcoded to Friday in `shared.js` (`YOUTH_NIGHT_DOW = 5`) — update if different
- QR codes must be generated from the live Netlify URL (not localhost) to be permanent
- No RLS — acceptable for V1, revisit in V2
- Term review submission tracking uses localStorage — if leader clears browser data, submit state resets (cosmetic only, data is already saved to DB)
- The `leader.html` weekly entry uses no-youth-night flag from `weekly_stats` — pastor must set this before leaders try to submit for that week

---

## v0.2.1 — Pre-deploy Bug Fixes
**Date:** 3 October 2026
**Status:** Critical bugs patched. Ready for Netlify deploy.

### Bug fixes

| Bug | File | Severity |
|---|---|---|
| `showError`/`hideError` used HTML `hidden` attribute instead of CSS class — errors never displayed | `shared.js` | Critical |
| `setLoading()` called on `<select>` in index.html — destroyed campus options on leader load, breaking login | `index.html` | Critical |
| Duplicate `change` event listener added to status select on every modal open | `new-people.html` | Minor |
| `.dup-warning` class missing from shared.css — duplicate warning rendered unstyled | `shared.css` | Cosmetic |
| `.mb-6` utility class missing from shared.css | `shared.css` | Cosmetic |

---

## v0.3.1 — Campus Select Bug Fix
**Date:** 3 October 2026
**Status:** Hotfix. Campus dropdown was empty on landing page — login broken.

### Root cause
The Supabase client was initialised with the newer `sb_publishable_...` key format. The `supabase-js@2` library loaded via CDN (`@2` tag) was resolving to a version that does not correctly handle this key format when constructing the `Authorization` header, causing all API requests to silently fail (no campuses returned, no error thrown in the browser).

Additionally, using `@supabase/supabase-js@2` without a pinned version meant any CDN cache refresh could pull a different library build — unpredictable in production.

### Fixes

| Fix | File | Detail |
|---|---|---|
| Switched to legacy JWT anon key | `shared.js` | JWT format (`eyJ...`) is supported by all v2.x builds of supabase-js |
| Pinned supabase-js CDN to `v2.50.0` | All HTML pages | Prevents unexpected behaviour from unpinned `@2` CDN tag |

---

## v1.0.0 — Pilot
- Deploy to Netlify
- One campus pilot (2–4 weeks)
- Feedback → fixes → state-wide rollout

### v2.0.0 (Post-pilot)
- Planning Centre API integration (auto-pull attendance)
- Row Level Security (RLS) on Supabase
- Year-on-year comparison charts
- Faith goals (campus annual targets)
- PDF / export
- Historical data migration tool
