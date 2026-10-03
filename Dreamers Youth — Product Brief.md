Dreamers Youth

Ministry Management System

# Product Brief — Final

Version 3.0 October 2026 Status: Ready to build

Contents

- [The problem](#problem)
- [The solution](#solution)
- [Users & roles](#users)
- [Youth health categories](#categories)
- [Pastoral care sheet](#pastoral)
- [End-of-term review](#termreview)
- [Core modules](#modules)
- [Data model](#data)
- [Architecture](#arch)
- [Pages & routes](#pages)
- [V1 scope](#scope)
- [What's missing / tidy](#gaps)
- [Decisions log](#decisions)
- [Next steps](#next)

01 — The problem

## Ministry data is fragmented and manual

Every week, a campus youth pastor stitches together data from Planning Centre, a per-campus Google Sheet, and a combined state spreadsheet. New people details are copied by hand from a Google Form. Pastoral health reviews happen informally, if at all. New Christian discipleship steps are tracked separately. The people doing ministry spend more time moving data than caring for youth.

02 — The solution

## One system, one source of truth

A purpose-built web application that replaces the Google Sheets workflow. Leaders enter data once. Pastors see it immediately. New people scan a QR code and their details feed directly into the pipeline — no manual copying. End-of-term reviews appear automatically in each leader's portal when the pastor opens the review period. The dashboard computes everything.

Planning Centre continues for service scheduling and roll-call. One attendance number per week is manually entered here. Everything else lives in this system.

03 — Users & roles

## Two roles, deliberately simple access

Youth Leader

- Selects campus + name to access (no login)
- Sees their youth roster, pre-loaded by pastor
- Marks expected attendance weekly
- Views their allocated new people + NCs
- Can manually add NP/NC entries as fallback
- Completes end-of-term reviews in their portal
- Maintains pastoral care sheet per youth

Youth Pastor

- Selects campus + name to access (no login)
- Adds leaders and builds their youth rosters
- Manages NP pipeline + NC pathway (assigns leaders)
- Can also input/reassign NP and NC
- Enters campus weekly stats
- Opens and closes end-of-term reviews
- Views full stats dashboard

Authentication is name-select — leader picks campus then their name. No passwords, no magic links. End-of-term reviews appear in the leader's normal portal when the pastor opens the review period; no special URL needed.

04 — Youth health categories

## Four categories, set at end of term

Every youth on a leader's roster is assigned a pastoral health category during the end-of-term review. This is the key health metric of the ministry — not just who's attending, but where they are in their journey.

1 — Highest Contributor

2 Connected

3 Community

4 Archived

**Contributor** — actively serving in some capacity. The deepest level of engagement. Youth who are invested enough to give, not just receive.

**Connected** — well connected into the program and to people. Relational depth, regular presence. More than just attending.

**Community** — attending but more loosely connected. Regular enough to know, but not yet embedded. The main entry category for new activations.

**Archived** — no longer active. Retained on record but removed from active reports and listings.

New youth default to Community on activation. Category changes are made during the pastoral review, not week-to-week. The key dashboard stat: distribution across Contributor / Connected / Community per leader and per campus.

05 — Pastoral care sheet

## Discipleship milestones per young person

Each youth on a leader's roster has a pastoral care sheet — a simple record of their key discipleship milestones. The leader maintains this; it's always visible alongside the youth's name and category.

💧

Water Baptism

Baptised? Yes / No, with date when known.

🔥

Holy Spirit Baptism

Baptised in the Holy Spirit? Yes / No, with date.

🙌

Serving

Are they serving? Yes / No, and in what role.

These fields sit on the youth_roster record. They can be updated at any time — not just at end of term. A youth who gets water baptised mid-term should have that recorded the same week. These fields feed into the dashboard stats (e.g. % of roster water baptised per campus).

06 — End-of-term review

## Pastor opens it — leaders complete it in their portal

At the end of each term, the pastor clicks "Open Term Review" on their dashboard. This unlocks the review section in every leader's portal on the campus. Leaders log in the normal way (campus + name select), see a "Term Review" section, complete it, and submit. The pastor sees results collate in real time. When done, the pastor closes the term.

What each leader sees in their term review

Auto-generated term stats (read-only)

New people added

e.g. 4 this term

From their NP allocations

Attendance average

e.g. 7.2 / week

From their weekly entries

Expected average

e.g. 8.5 / week

From their Yes counts

Attendance rate

e.g. 85%

Attended ÷ expected

Roster change

e.g. +2 this term

Start vs. end of term

NP connected

e.g. 3 of 4

From NP review below

Leader fills in

- Per youth: update category (Contributor / Connected / Community / Archived) + write pastoral comment
- Per allocated new person: connection status + notes
- Per allocated new Christian: NC step updates (baptism, bible, Fresh Start)

07 — Core modules

## Five modules, one application

1

New People Pipeline

Pastor + Leaders

Replaces the Boys/Girls NP Google Sheet. New visitors scan a QR code → fill in a simple registration form → details feed directly into the system. No Google Form, no manual copying. Pastor assigns leader. Leaders can also manually add as a fallback, and can reassign if needed.

QR SCAN

Self-registers

→

VISIT 1

First timer

→

VISIT 2

Second timer

→

VISIT 3

Third timer

→

ACTIVATED

Joins roster

|

ARCHIVED

Removed

Fields

Name, phone, school, year level, gender

Parent name and phone

Who brought them (friend)

Leader allocation (pastor assigns; leader can reassign)

1st, 2nd, 3rd visit dates

Catch-up logged (meaningful connection)

Edit / override any field at any time

Activation → auto-added to leader's roster as Community

NC fields (when applicable — same record)

Is new Christian flag

Decision date + type (First Time / Rededication)

Water baptism date

Bible given

Fresh Start started / completed

NC leader assigned

2

Leader Portal

Leaders

Mobile-first. Leaders see only what's theirs. Their roster is pre-loaded by the pastor — leaders open the page and their young people are already there. The live year/gender breakdown is pastor-only.

Weekly entry

Youth roster — pre-loaded, shows category + care milestones

Expected attendance — Yes / Maybe / No with reason

Live breakdown by year and gender (pastor only)

My history (past submissions)

Pastoral care (any time)

Update water baptism / HS baptism / serving per youth

View my allocated new people

View my allocated new Christians

Can manually add NP/NC as fallback

End of term (when pastor opens review)

Auto term stats (read-only)

Category + pastoral comment per youth

NP connection status per new person

NC step updates per new Christian

3

NC Discipleship Pathway

Pastor + Leaders

For roster youth who make a decision outside the NP pipeline (e.g. a regular attendee makes a first-time decision). Gets their own record linked to their roster entry. If someone is also a new person, NC fields live on the NP record — no separate entry needed.

Name + decision date

Decision type: First Time / Rededication

Leader assigned (pastor assigns; leader can reassign)

Water baptism date

Bible given date

Fresh Start started / completed

Linked to youth roster record

Notes

4

Pastor Weekly Entry

Pastors

Campus-level life metrics, once per week after youth night. One number from Planning Centre, everything else computed or entered here.

Actual attendance (from Planning Centre)

Total in department, total leaders

1st, 2nd, 3rd timers

First-time decisions, rededications

Bibles given, Fresh Start / NC course

Water baptisms, HS baptisms

Youth Connect, Sunday, Saints attendance

Schools visited, no youth night flag

5

Stats Dashboard

Pastors

Replaces the combined state spreadsheet. Auto-computed from all submissions. Pastors also manage campus setup from here.

Campus health snapshot

Leader submission status (who's missing)

Key health stats table by week

Year-on-year comparison

Category distribution (Contributor / Connected / Community)

NP connection rate per term

NC step completion rates

Discipleship milestone stats (baptism %, serving %)

Year level and gender breakdown (pastor only)

Manage leaders + rosters

Open / close term review

Term review collated results

★ = new or changed since v1

08 — Data model

## Supabase schema — 9 tables

campuses

7 ministry campuses

idnameslugarchived

leaders

Leaders and pastors per campus

idcampus_idnameroleactive

youth_roster

Youth per leader — includes care sheet + category

idleader_idcampus_id nameyear_levelgender category water_baptisedwater_baptism_date hs_baptisedhs_baptism_date servingserving_role pastoral_noteslast_reviewed_termactive

new_people

Visitor pipeline — NC fields included when applicable

idcampus_idleader_id namephoneschool year_levelgenderparent_name parent_phonefriend visit_1_datevisit_2_datevisit_3_date catchup_donestatusconnection_status activated_datearchived_reasonnotes is_new_christiandecision_datedecision_type nc_leader_idbaptism_donebaptism_date bible_givenfresh_start_startedfresh_start_completed

new_christians

NC records for roster youth (not in NP pipeline)

idcampus_idleader_id youth_roster_idname decision_datedecision_type baptism_donebaptism_date bible_givenfresh_start_startedfresh_start_completed notesarchived

leader_entries

Weekly expected attendance per leader

idleader_idcampus_id entry_datetermweek_number attendance_listingsunday_attendanceconnect_attendance

weekly_stats

Campus-level weekly life metrics

idcampus_identry_date termattendancefirst_timers second_timersthird_timerssalvations_first salvations_rededsbibles_givenfresh_start water_baptismshs_baptismsschools_visited connect_attendancesunday_attendancesaints_attendance no_youth_nightnotes

term_reviews

Tracks open/closed state of end-of-term review periods

idcampus_id termyear opened_atclosed_at

faith_goals

Per-campus annual targets

idcampus_id yearmetric_keygoal_value

Blue = primary key · Orange = foreign key · Green = new field

09 — Architecture

## Simple, deployable, maintainable

Frontend

Vanilla HTML/CSS/JS

Multi-page. Shared shared.js + shared.css. No npm, no build step, no framework. Claude writes every file.

Backend + Database

Supabase

PostgreSQL, REST API called directly from the browser. Already in use.

Authentication

Campus + name select

No login. Pick campus, pick name. Everything personalises from there. Term reviews appear automatically when the pastor opens the review period.

Version control

GitHub

Every change is saved with full history. Can roll back to any previous version. Claude updates files → GitHub Desktop: Commit → Push. Two clicks.

Hosting

Netlify

Connected to GitHub. Auto-deploys on every push — no drag and drop. Stable URL for QR codes and leader bookmarks. Free tier sufficient.

Updates

Cowork → GitHub → live

Describe the change to Claude in Cowork → files update → open GitHub Desktop → Commit → Push → Netlify deploys in \~30 seconds. No code knowledge needed.

File structure — `dreamers-youth` GitHub repo

📁 dreamers-youth/

├── index.html ← campus + name select

├── leader.html ← leader portal (weekly + care + term review)

├── register.html ← QR registration form (public, no login)

├── new-people.html ← NP pipeline (pastor view)

├── new-christians.html ← NC discipleship (pastor view)

├── dashboard.html ← stats + setup + term management

├── shared.js ← Supabase client, helpers, identity

└── shared.css ← design tokens, components

How updates work — every time

Step 1

Describe change\
to Claude

in Cowork

→

Step 2

Claude updates\
the files

automatically

→

Step 3

Commit + Push\
in GitHub Desktop

two clicks

→

Step 4

Netlify deploys\
automatically

\~30 seconds

10 — Pages & routes

## Every screen in the system

/

Campus + Name Select

Everyone

/leader

Leader Portal

Leaders

/leader#roster

My Roster + Care

Leaders

/leader#new-people

My New People

Leaders

/leader#term-review

Term Review

Leaders (when open)

/register

QR Registration

New visitors

/new-people

NP Pipeline

Pastors

/new-christians

NC Discipleship

Pastors

/dashboard

Stats Dashboard

Pastors

/dashboard#entry

Weekly Entry

Pastors

/dashboard#term

Term Management

Pastors

/admin

Manage Leaders + Rosters

Pastors

11 — V1 scope

## What we build first, what comes later

| Feature | When | Notes |
| --- | --- | --- |
| Campus + name select (no login) | V1 | Simple identity for all users |
| Leader portal — expected attendance | V1 | Yes / Maybe / No per youth, with reason |
| Youth roster with categories + care sheet | V1 | Contributor / Connected / Community / Archived, water baptism, HS baptism, serving |
| QR registration form | V1 | Public page, feeds directly into new_people table |
| NP pipeline — full CRM | V1 | Manual entry, edit/override, visits, catch-up, activation |
| NC fields on NP record | V1 | When NP also made a decision — same record |
| NC discipleship pathway | V1 | Standalone records for roster youth who decide |
| Leader + pastor can input and reassign NP/NC | V1 | Pastor primary, leader as fallback |
| Term review — open/close by pastor | V1 | Appears in leader portal automatically |
| Term review — auto stats per leader | V1 | NP added, attendance avg, expected avg, rate, roster change |
| Term review — pastoral category + comment | V1 | Leader fills in per youth |
| Pastor weekly stats entry | V1 | All life metrics |
| Stats dashboard (campus view) | V1 | Snapshot, health stats table, category distribution |
| Manage leaders and youth rosters | V1 | Pastor builds each leader's roster |
| Year/gender breakdown (pastor only) | V1 | Not shown to leaders |
| Year-on-year comparison charts | V2 | Term and year comparisons |
| Faith goals | V2 | Per-campus annual targets vs actuals |
| Planning Centre integration | V2 | Pull attendance via API |
| PDF / export | V2 | Export stats, rosters, or term reports |

12 — Professional assessment

## What's genuinely missing, and what could be tidier

Ten things worth addressing — either now or in V2. Listed in order of impact.

Address now Absence flag — the silent gap

✓ Confirmed. A youth marked "No" three or more consecutive weeks represents a pastoral concern the system should surface. A visual indicator on the roster — "not expected for 3+ weeks" — gives leaders a weekly pastoral prompt without any extra input. Low effort, high pastoral value. Will be built into the roster view.

Address now Duplicate detection with merge

✓ Confirmed. When a new person is added (QR or manual), the system checks for a matching name + phone number and flags a warning before creating a second record. If a duplicate is confirmed, the pastor can review both records side-by-side and merge them into one — keeping the most complete data — then remove the duplicate. No data is lost in the merge.

Address now Activation flow

✓ Confirmed. After the 3rd visit is logged, the person is flagged "ready to activate." Pastor confirms with one click. On activation: they instantly join the leader's roster as **Community**. The leader can change their category at any time — including immediately. The NP leader becomes their roster leader automatically; pastor can reassign after.

Address now Term roster change — week 1 vs final week

✓ Confirmed. Roster change is computed from the attendance listing in week 1 of the term vs the final week — not a manual snapshot. The system counts youth listed in each leader's first entry of the term and their last, and shows the difference. This means no snapshot needed at review-open time; it's always computed from the actual entry data.

Address now Campus-specific QR codes + manual NP entry

✓ Confirmed. Each campus gets its own QR code, generated from the admin dashboard, pre-selecting that campus on the registration form. Additionally, pastors and leaders can manually enter a new person directly onto the NP database via a form on the new-people page — for cases where QR wasn't used or details need to be entered after the fact.

Address now New assignment awareness

Since there are no email links or push notifications, a leader only knows they've been assigned a new person if they happen to check the portal. A "pending" badge on their home screen — "2 new people assigned" — solves this immediately. Visible the moment they log in, cleared when they've viewed those records. No notifications needed.

Address now Serving → Contributor auto-update

✓ Confirmed. When a leader marks a youth as "Serving = Yes" on their care sheet, their category automatically updates to Contributor. If serving is later removed, the category does not auto-downgrade — the leader sets it manually from that point. This keeps the Contributor category meaningful and self-maintaining.

Tidy up New person "first contact" step

The pipeline goes QR scan → visit 1 → visit 2 → visit 3. But in practice a leader reaches out before the new person returns for visit 2. A simple "initial contact made" checkbox — like catch-up but earlier in the flow — captures this step without complexity. Helps leaders see who hasn't been contacted yet.

Address now No-youth-night weeks and leader entries

✓ Confirmed. When the pastor marks "no youth night" for a week, the leader entry form for that week is suppressed and those weeks are excluded from term averages (attendance rate, expected average, etc.). This keeps the stats honest.

Tidy up Historical data migration

When the system goes live, existing NP, NC, and roster data needs to move across from Google Sheets. Options: a simple import tool (Claude can build this as a one-off), or a clean cutover date after which old sheets are reference-only and everything new enters this system. Don't go live with an empty database — leaders will lose confidence immediately.

13 — Decisions log

## All 19 decisions resolved

✓ Resolved

Authentication

Campus + name select. No login, no magic links, no tokens.

✓ Resolved

Roles

Two only — Youth Leader and Youth Pastor. No state-level role.

✓ Resolved

QR registration

Custom register.html feeds directly into new_people table. Google Form removed entirely.

✓ Resolved

NP + NC overlap

One record. NC fields added to the NP record when applicable. Standalone NC table only for non-pipeline roster youth.

✓ Resolved

Who assigns NP + NC leaders

Pastor is primary. Leaders can also manually add and reassign as a fallback.

✓ Resolved

Youth health categories

Four: Contributor, Connected, Community, Archived. New activations default to Community.

✓ Resolved

Year/gender breakdown visibility

Pastor-only. Not shown in the leader portal.

✓ Resolved

End-of-term report access

No unique URLs per leader. Reviews appear in the leader's normal portal when pastor opens the term review period.

✓ Resolved

Roster pre-loading

Pastor builds each leader's roster. Leaders open their page and their young people are already there.

✓ Resolved

Absence flagging

Youth marked "No" for 3+ consecutive weeks gets a visual flag on the roster. Built into the leader portal.

✓ Resolved

Duplicate prevention

System checks name + phone on add. Flags duplicate, offers side-by-side merge, removes the duplicate record.

✓ Resolved

Activation trigger

After 3rd visit: system flags "ready to activate." Pastor confirms with one click. Instantly joins roster as Community. Leader can change category immediately.

✓ Resolved

Term roster change calculation

Computed from attendance listing: week 1 of term vs final week of term. No snapshot required — derived from entry data.

✓ Resolved

Campus QR codes + manual NP entry

One QR per campus (admin dashboard generates it), pre-selects campus on the form. Manual entry form also available on the NP page for pastors and leaders.

✓ Resolved

Serving → auto-updates to Contributor

When serving is ticked Yes, category auto-updates to Contributor. Removing serving does not auto-downgrade — leader sets category manually from that point.

✓ Resolved

No-youth-night weeks

Suppresses leader entry form for that week. Excludes week from all term averages and rate calculations.

14 — Next steps

## Ready to build — in this order

✓

GitHub repo created

dreamers-youth repository set up. GitHub Desktop installed and connected.

1

Connect Netlify to GitHub

Go to netlify.com → New site → Import from GitHub → select dreamers-youth. Auto-deploy is active from this point.

2

Supabase schema — all 9 tables

Claude writes the complete SQL here in Cowork. One paste into the Supabase SQL editor. Done once.

3

shared.js + shared.css

Supabase client, identity helpers (campus/name select), design tokens, common components. Every other page imports these.

4

index.html — campus + name select

The entry point. Routes to leader.html or dashboard.html based on role.

5

register.html — QR registration form

Public page. New visitor fills in their details. Feeds directly to new_people table. Generate campus QR codes from admin.

6

leader.html — leader portal

Roster, expected attendance, pastoral care sheet, new people view, term review section.

7

new-people.html + new-christians.html

NP pipeline CRM and NC discipleship pathway for pastors.

8

dashboard.html — stats + setup

Weekly entry, health stats, manage leaders/rosters, term management, collated results.

9

Pilot with one campus

Push to GitHub → Netlify deploys → share URL with one campus for real testing. Then roll out state-wide.