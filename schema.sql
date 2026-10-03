-- Dreamers Youth — Supabase Schema v1.0
-- Paste this entire file into the Supabase SQL editor and run once.
-- Update the seed data at the bottom with real campus names before running.

-- ── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE campuses (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name     text NOT NULL,
  slug     text NOT NULL UNIQUE,
  archived boolean DEFAULT false
);

CREATE TABLE leaders (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id uuid REFERENCES campuses(id) ON DELETE CASCADE,
  name      text NOT NULL,
  role      text NOT NULL CHECK (role IN ('leader','pastor')),
  active    boolean DEFAULT true
);

CREATE TABLE youth_roster (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_id          uuid REFERENCES leaders(id) ON DELETE SET NULL,
  campus_id          uuid REFERENCES campuses(id) ON DELETE CASCADE,
  name               text NOT NULL,
  year_level         text,
  gender             text,
  category           text NOT NULL DEFAULT 'community'
                       CHECK (category IN ('contributor','connected','community','archived')),
  water_baptised     boolean DEFAULT false,
  water_baptism_date date,
  hs_baptised        boolean DEFAULT false,
  hs_baptism_date    date,
  serving            boolean DEFAULT false,
  serving_role       text,
  pastoral_notes     text,
  last_reviewed_term text,
  active             boolean DEFAULT true,
  created_at         timestamptz DEFAULT now()
);

CREATE TABLE new_people (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id             uuid REFERENCES campuses(id) ON DELETE CASCADE,
  leader_id             uuid REFERENCES leaders(id) ON DELETE SET NULL,
  name                  text NOT NULL,
  phone                 text,
  school                text,
  year_level            text,
  gender                text,
  parent_name           text,
  parent_phone          text,
  friend                text,
  visit_1_date          date,
  visit_2_date          date,
  visit_3_date          date,
  catchup_done          boolean DEFAULT false,
  initial_contact_done  boolean DEFAULT false,
  status                text NOT NULL DEFAULT 'visit_1'
                          CHECK (status IN ('visit_1','visit_2','visit_3','ready_to_activate','activated','archived')),
  connection_status     text,
  activated_date        date,
  archived_reason       text,
  notes                 text,
  is_new_christian      boolean DEFAULT false,
  decision_date         date,
  decision_type         text CHECK (decision_type IN ('first_time','rededication')),
  nc_leader_id          uuid REFERENCES leaders(id) ON DELETE SET NULL,
  baptism_done          boolean DEFAULT false,
  baptism_date          date,
  bible_given           boolean DEFAULT false,
  fresh_start_started   boolean DEFAULT false,
  fresh_start_completed boolean DEFAULT false,
  created_at            timestamptz DEFAULT now()
);

CREATE TABLE new_christians (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id             uuid REFERENCES campuses(id) ON DELETE CASCADE,
  leader_id             uuid REFERENCES leaders(id) ON DELETE SET NULL,
  youth_roster_id       uuid REFERENCES youth_roster(id) ON DELETE SET NULL,
  name                  text NOT NULL,
  decision_date         date,
  decision_type         text CHECK (decision_type IN ('first_time','rededication')),
  baptism_done          boolean DEFAULT false,
  baptism_date          date,
  bible_given           boolean DEFAULT false,
  fresh_start_started   boolean DEFAULT false,
  fresh_start_completed boolean DEFAULT false,
  notes                 text,
  archived              boolean DEFAULT false,
  created_at            timestamptz DEFAULT now()
);

CREATE TABLE leader_entries (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_id          uuid REFERENCES leaders(id) ON DELETE CASCADE,
  campus_id          uuid REFERENCES campuses(id) ON DELETE CASCADE,
  entry_date         date NOT NULL,
  term               text NOT NULL,
  week_number        integer,
  attendance_listing jsonb DEFAULT '[]'::jsonb,
  sunday_attendance  integer,
  connect_attendance integer,
  created_at         timestamptz DEFAULT now(),
  UNIQUE (leader_id, entry_date)
);

CREATE TABLE weekly_stats (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id          uuid REFERENCES campuses(id) ON DELETE CASCADE,
  entry_date         date NOT NULL,
  term               text NOT NULL,
  attendance         integer,
  first_timers       integer,
  second_timers      integer,
  third_timers       integer,
  salvations_first   integer,
  salvations_rededs  integer,
  bibles_given       integer,
  fresh_start        integer,
  water_baptisms     integer,
  hs_baptisms        integer,
  schools_visited    integer,
  connect_attendance integer,
  sunday_attendance  integer,
  saints_attendance  integer,
  no_youth_night     boolean DEFAULT false,
  notes              text,
  created_at         timestamptz DEFAULT now(),
  UNIQUE (campus_id, entry_date)
);

CREATE TABLE term_reviews (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id  uuid REFERENCES campuses(id) ON DELETE CASCADE,
  term       text NOT NULL,
  year       integer NOT NULL,
  opened_at  timestamptz,
  closed_at  timestamptz,
  created_at timestamptz DEFAULT now()
);

-- V2 only — schema included for future Planning Centre integration
CREATE TABLE faith_goals (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campus_id  uuid REFERENCES campuses(id) ON DELETE CASCADE,
  year       integer NOT NULL,
  metric_key text NOT NULL,
  goal_value numeric,
  UNIQUE (campus_id, year, metric_key)
);

-- ── Seed: update these campus names/slugs before running ─────────────────────

INSERT INTO campuses (name, slug) VALUES
  ('Campus 1', 'campus-1'),
  ('Campus 2', 'campus-2'),
  ('Campus 3', 'campus-3'),
  ('Campus 4', 'campus-4'),
  ('Campus 5', 'campus-5'),
  ('Campus 6', 'campus-6'),
  ('Campus 7', 'campus-7');
