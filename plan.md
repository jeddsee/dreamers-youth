# Dreamers Youth — Build Plan

Version 1.0 · October 2026

---

## What we're building

A web-based ministry management system that replaces fragmented Google Sheets workflows across 7 youth ministry campuses. Leaders and pastors access it via a simple campus + name select (no login). The system tracks attendance, new visitors, new Christian discipleship, and end-of-term pastoral health reviews — all in one place.

---

## Build order

Each step is a deployable unit. Netlify auto-deploys on every GitHub push, so each step can be tested live before moving on.

---

### Step 0 — Infrastructure (do once, before any code)

- [ ] Netlify: connect to `dreamers-youth` GitHub repo → auto-deploy active
- [ ] Supabase: run the full SQL schema (all 9 tables) in the SQL editor
- [ ] Confirm Supabase anon key + project URL are known

**Done when:** Netlify URL is live, Supabase tables exist and are visible.

---

### Step 1 — shared.js + shared.css

Foundation that every other page depends on. Build this first so subsequent pages just import it.

**shared.js:**
- Supabase client initialisation (project URL + anon key)
- `getIdentity()` — reads campus + leader from sessionStorage
- `requireIdentity(role)` — redirects to `/` if no identity or wrong role
- `formatDate()`, `termFromDate()`, `weekOfTerm()` helpers
- Campus + leader lookup helpers

**shared.css:**
- Design tokens (colours, type scale, spacing)
- Base reset and layout primitives
- Card, button, badge, table, form components
- Mobile-first responsive grid

**Done when:** Both files exist in the repo and have no import errors.

---

### Step 2 — index.html (Campus + Name Select)

Entry point for all users. No login — pick campus, pick name, go.

**Behaviour:**
- Dropdown of active campuses (from `campuses` table)
- On campus select: load active leaders for that campus
- On name select: store `{ campus_id, campus_name, leader_id, leader_name, role }` in sessionStorage
- Route to `leader.html` (role = leader) or `dashboard.html` (role = pastor)
- "New visitor" link → `register.html`

**Done when:** Selecting campus + name lands the right person on the right page.

---

### Step 3 — register.html (QR Registration Form)

Public page — no identity required. New visitors scan a QR code and self-register.

**Behaviour:**
- Campus pre-selected from URL param (e.g. `?campus=riverstone`)
- Fields: name, phone, school, year level, gender, parent name, parent phone, who brought them
- On submit: write to `new_people` with `status = 'visit_1'`, timestamp
- Success screen: "Thanks! See you next week."
- Duplicate check: if name + phone matches existing record, flag and do not create duplicate

**Done when:** A QR code scan → form → submission creates a `new_people` record visible in Supabase.

---

### Step 4 — leader.html (Leader Portal)

Mobile-first. The screen leaders use every week.

**Sections (tab/hash navigation):**

#### #roster — My Roster + Care
- List all active youth on this leader's roster
- Show category badge (Contributor / Connected / Community)
- Show care sheet icons: 💧 water baptism, 🔥 HS baptism, 🙌 serving
- Absence flag: red indicator if youth marked "No" for 3+ consecutive weeks
- Tap youth → inline edit of care sheet fields
- Serving = Yes → auto-set category to Contributor

#### #weekly — Weekly Entry
- Entry date defaults to most recent youth night
- Per-youth row: Yes / Maybe / No toggle + reason if No or Maybe
- Submit button — writes to `leader_entries`
- "No youth night" weeks: form suppressed, show message

#### #new-people — My New People
- List of NP records assigned to this leader
- "New assigned" badge count on tab if unviewed
- Can manually add NP (fallback) or reassign
- View visit history, catch-up status

#### #term-review — Term Review (only visible when pastor has opened it)
- Read-only auto-stats block: NP added, attendance avg, expected avg, attendance rate, roster change
- Per youth: category dropdown + pastoral comment textarea
- Per NP: connection status + notes
- Per NC: step updates (baptism, bible, Fresh Start)
- Submit button — locks submission, visible to pastor

**Done when:** Leader can log weekly attendance, update care sheet, view NPs, and complete term review.

---

### Step 5 — new-people.html (NP Pipeline)

Pastor-only. Full CRM view for the new visitor pipeline.

**Behaviour:**
- Kanban-style or table view: visit_1 → visit_2 → visit_3 → ready_to_activate → activated → archived
- Duplicate detection on add (name + phone check) with side-by-side merge
- Assign/reassign leader
- "Ready to activate" badge after 3rd visit logged
- Activation: one-click confirm → youth_roster record created (Community), NP leader becomes roster leader
- Inline edit of all fields
- NC fields appear on NP record when `is_new_christian = true`

**Done when:** Full NP lifecycle works from self-register through to roster activation.

---

### Step 6 — new-christians.html (NC Discipleship)

Pastor-only. For roster youth who made a decision outside the NP pipeline.

**Behaviour:**
- List all NC records linked to youth roster entries
- Add NC record: search roster, pick youth, enter decision date + type
- Track: water baptism, Bible given, Fresh Start started/completed
- Assign/reassign NC leader
- Notes field

**Done when:** Standalone NC records can be created, assigned, and tracked independently of the NP pipeline.

---

### Step 7 — dashboard.html (Stats + Setup)

Pastor-only. The control centre.

**Sections:**

#### #entry — Weekly Stats Entry
- Fields for all campus-level life metrics (attendance from Planning Centre, 1st/2nd/3rd timers, salvations, baptisms, etc.)
- No-youth-night toggle — suppresses leader entry for the week

#### #snapshot — Campus Health
- Leader submission status (who's done this week, who's missing)
- Key health stats table by week (scrollable)
- Category distribution: Contributor / Connected / Community per leader + campus total
- NP connection rate, NC step completion rates
- Discipleship milestone stats (% water baptised, % serving per campus)
- Year level and gender breakdown

#### #term — Term Management
- Open / Close Term Review button
- When open: real-time collation of leader submissions (who's submitted, read-only stats)
- Collated results table: category changes, pastoral comments, NP connection, NC steps

#### #setup — Manage Leaders + Rosters
- Add / deactivate leaders
- Build/edit each leader's youth roster (add youth, reassign)
- Generate campus QR codes (links to `register.html?campus=slug`)

**Done when:** Pastor can run weekly entry, manage rosters, view all stats, and open/close term reviews.

---

### Step 8 — Pilot

- Deploy to Netlify
- Share URL with one campus (pastor + 2–3 leaders)
- Run for 2–4 weeks
- Gather feedback → fix before state-wide rollout

---

## V1 scope boundary

**In V1:**
Everything in Steps 1–7 above.

**V2 (after pilot):**
- Year-on-year comparison charts
- Faith goals (campus annual targets vs actuals)
- Planning Centre API integration (auto-pull attendance)
- PDF / export of stats, rosters, term reports
- Historical data migration tool

---

## Open questions before build starts

1. What is the Supabase project URL and anon key?
2. Are all 7 campus names/slugs confirmed?
3. Is the GitHub repo `dreamers-youth` already created?
4. Which campus pilots first?
