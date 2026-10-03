# Dreamers Youth — Architecture

Version 1.0 · October 2026

---

## Stack overview

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Vanilla HTML / CSS / JS | No build step, no npm, no framework. Claude writes files directly. |
| Database | Supabase (PostgreSQL) | Already in use. REST API called directly from the browser. |
| Auth | Campus + name select | No login. Identity stored in sessionStorage per visit. |
| Hosting | Netlify (GitHub auto-deploy) | Free tier. Auto-deploys on push. Stable URL for QR codes. |
| Version control | GitHub | Full history, rollback. GitHub Desktop for 2-click deploys. |

No server-side code. No API layer. The browser talks directly to Supabase using the public anon key and Supabase Row Level Security (RLS) controls what it can do.

---

## File structure

```
dreamers-youth/
├── index.html          ← campus + name select (everyone)
├── leader.html         ← leader portal (leaders)
├── register.html       ← QR registration form (public)
├── new-people.html     ← NP pipeline CRM (pastors)
├── new-christians.html ← NC discipleship (pastors)
├── dashboard.html      ← stats, setup, term management (pastors)
├── shared.js           ← Supabase client, identity, helpers
└── shared.css          ← design tokens, component styles
```

Every HTML page is a standalone file. Shared behaviour lives in `shared.js`. Shared styles in `shared.css`. No bundler, no imports beyond `<script src="shared.js">`.

---

## Identity model

There is no authentication in the traditional sense. Identity is established by selection:

1. User visits `index.html`
2. Picks campus from dropdown (loaded from `campuses` table)
3. Picks their name from dropdown (filtered by campus + active, from `leaders` table)
4. `{ campus_id, campus_name, leader_id, leader_name, role }` written to `sessionStorage`
5. Redirected to `leader.html` (role = `leader`) or `dashboard.html` (role = `pastor`)

`shared.js` exports `requireIdentity(role)` — called at the top of every protected page. If sessionStorage is empty or role doesn't match, redirect to `index.html`.

**Security note:** This is a convenience identity layer, not a security layer. The assumption is that all users are trusted ministry staff. If stronger access control is needed in future, Supabase RLS policies can be applied without changing the frontend architecture.

---

## Data model (9 tables)

### `campuses`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
name        text NOT NULL
slug        text NOT NULL UNIQUE  -- used in QR URL params
archived    boolean DEFAULT false
```

### `leaders`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
campus_id   uuid REFERENCES campuses(id)
name        text NOT NULL
role        text CHECK (role IN ('leader', 'pastor'))
active      boolean DEFAULT true
```

### `youth_roster`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
leader_id           uuid REFERENCES leaders(id)
campus_id           uuid REFERENCES campuses(id)
name                text NOT NULL
year_level          text
gender              text
category            text CHECK (category IN ('contributor','connected','community','archived'))
                    DEFAULT 'community'
water_baptised      boolean DEFAULT false
water_baptism_date  date
hs_baptised         boolean DEFAULT false
hs_baptism_date     date
serving             boolean DEFAULT false
serving_role        text
pastoral_notes      text
last_reviewed_term  text
active              boolean DEFAULT true
```

### `new_people`
```sql
id                    uuid PRIMARY KEY DEFAULT gen_random_uuid()
campus_id             uuid REFERENCES campuses(id)
leader_id             uuid REFERENCES leaders(id)  -- assigned leader
name                  text NOT NULL
phone                 text
school                text
year_level            text
gender                text
parent_name           text
parent_phone          text
friend                text  -- who brought them
visit_1_date          date
visit_2_date          date
visit_3_date          date
catchup_done          boolean DEFAULT false
initial_contact_done  boolean DEFAULT false  -- pre-visit-2 contact step
status                text CHECK (status IN ('visit_1','visit_2','visit_3','ready_to_activate','activated','archived'))
connection_status     text  -- set at term review
activated_date        date
archived_reason       text
notes                 text
-- NC fields (populated when is_new_christian = true)
is_new_christian      boolean DEFAULT false
decision_date         date
decision_type         text CHECK (decision_type IN ('first_time','rededication'))
nc_leader_id          uuid REFERENCES leaders(id)
baptism_done          boolean DEFAULT false
baptism_date          date
bible_given           boolean DEFAULT false
fresh_start_started   boolean DEFAULT false
fresh_start_completed boolean DEFAULT false
```

### `new_christians`
For roster youth who made a decision outside the NP pipeline.
```sql
id                    uuid PRIMARY KEY DEFAULT gen_random_uuid()
campus_id             uuid REFERENCES campuses(id)
leader_id             uuid REFERENCES leaders(id)
youth_roster_id       uuid REFERENCES youth_roster(id)
name                  text NOT NULL  -- denormalised for display
decision_date         date
decision_type         text CHECK (decision_type IN ('first_time','rededication'))
baptism_done          boolean DEFAULT false
baptism_date          date
bible_given           boolean DEFAULT false
fresh_start_started   boolean DEFAULT false
fresh_start_completed boolean DEFAULT false
notes                 text
archived              boolean DEFAULT false
```

### `leader_entries`
Weekly expected-attendance submissions from leaders.
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
leader_id           uuid REFERENCES leaders(id)
campus_id           uuid REFERENCES campuses(id)
entry_date          date NOT NULL
term                text NOT NULL  -- e.g. 'T3 2026'
week_number         integer
attendance_listing  jsonb  -- array of { youth_id, status: 'yes'|'maybe'|'no', reason? }
sunday_attendance   integer
connect_attendance  integer
```

### `weekly_stats`
Campus-level life metrics, entered by pastors.
```sql
id                    uuid PRIMARY KEY DEFAULT gen_random_uuid()
campus_id             uuid REFERENCES campuses(id)
entry_date            date NOT NULL
term                  text NOT NULL
attendance            integer  -- from Planning Centre
first_timers          integer
second_timers         integer
third_timers          integer
salvations_first      integer
salvations_rededs     integer
bibles_given          integer
fresh_start           integer
water_baptisms        integer
hs_baptisms           integer
schools_visited       integer
connect_attendance    integer
sunday_attendance     integer
saints_attendance     integer
no_youth_night        boolean DEFAULT false
notes                 text
```

### `term_reviews`
Tracks open/closed state for end-of-term review periods.
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
campus_id   uuid REFERENCES campuses(id)
term        text NOT NULL  -- e.g. 'T3'
year        integer NOT NULL
opened_at   timestamptz
closed_at   timestamptz
```
A term is "open" when `opened_at IS NOT NULL AND closed_at IS NULL`.

### `faith_goals`
Per-campus annual targets (V2, schema included for future use).
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
campus_id   uuid REFERENCES campuses(id)
year        integer NOT NULL
metric_key  text NOT NULL
goal_value  numeric
```

---

## Key data flows

### New visitor self-registers (QR)
```
register.html
  → INSERT new_people (status='visit_1', campus pre-set from URL param)
  → Supabase new_people table
  → Pastor sees in new-people.html, assigns leader
```

### Pastor activates a new person (after 3rd visit)
```
new-people.html — "Activate" button
  → INSERT youth_roster (category='community', leader_id from NP record)
  → UPDATE new_people SET status='activated', activated_date=today
  → Leader's roster immediately updates
```

### Leader logs weekly attendance
```
leader.html #weekly
  → UPSERT leader_entries (entry_date, attendance_listing jsonb)
```

### Term review
```
Pastor: dashboard.html #term → INSERT term_reviews (opened_at = now())
  → leader.html checks: SELECT term_reviews WHERE campus_id = X AND closed_at IS NULL
  → Shows #term-review tab to leaders
  → Leader submits: UPDATE youth_roster categories + pastoral_notes per youth
                    UPDATE new_people connection_status per NP
                    UPDATE new_christians steps per NC
  → Pastor: dashboard.html #term → sees collated results in real time
  → Pastor closes: UPDATE term_reviews SET closed_at = now()
```

### Absence flagging
```
leader.html #roster — on page load:
  SELECT leader_entries for last 3 weeks for this leader
  For each youth: check attendance_listing jsonb for 3+ consecutive 'no'
  If true: render red absence badge on that youth's row
```

### Serving → Contributor auto-update
```
leader.html — care sheet: serving toggle ON
  → UPDATE youth_roster SET serving=true, category='contributor' WHERE id=?
  serving toggle OFF:
  → UPDATE youth_roster SET serving=false (category unchanged — leader sets manually)
```

---

## Dashboard computed stats

All dashboard stats are computed client-side from raw Supabase data. No stored aggregates.

| Stat | Source |
|---|---|
| Attendance average | `leader_entries.attendance_listing` (count of 'yes' + 'maybe') ÷ weeks (excluding no-youth-night) |
| Expected average | count of 'yes' rows ÷ weeks |
| Attendance rate | attended ÷ expected |
| Roster change | youth_roster count in week 1 vs final week of term (from `attendance_listing`) |
| NP added this term | `new_people` WHERE `leader_id = X` AND `visit_1_date` within term dates |
| NP connected | count of NP WHERE `connection_status = 'connected'` this term |
| Category distribution | `youth_roster` GROUP BY category per leader / campus |
| NC step rates | `new_people` + `new_christians` step fields, per campus |
| Discipleship milestones | `youth_roster.water_baptised`, `.hs_baptised`, `.serving` per campus |

---

## Deployment pipeline

```
Claude edits file in Cowork
  → GitHub Desktop: Commit → Push (2 clicks)
  → Netlify detects push to main
  → Netlify builds (static, no build step — just copies files)
  → Live in ~30 seconds
```

QR codes are permanent Netlify URLs (`dreamers-youth.netlify.app/register?campus=riverstone`). They survive any code change because the URL never changes.

---

## Supabase access

The browser uses the Supabase **anon key** (public, safe to expose). Row Level Security policies can be added later if needed, but are not required for V1 given the trust model (known ministry staff only).

All Supabase calls are direct REST from the browser:
```js
const { data, error } = await supabase
  .from('youth_roster')
  .select('*')
  .eq('leader_id', identity.leader_id)
  .eq('active', true)
```

No server functions, no edge functions, no serverless — just the browser and Supabase.
