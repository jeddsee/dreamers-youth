// shared.js — Dreamers Youth v1.0
// Foundation: Supabase client, identity management, date/term helpers.
// Every page imports this via <script src="shared.js">.

// ── Config ────────────────────────────────────────────────────────────────────
// Replace these with real values from Supabase → Project Settings → API
const SUPABASE_URL      = 'https://dfozyykukmwcskacqyhq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmb3p5eWt1a213Y3NrYWNxeWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMDk4OTYsImV4cCI6MjEwNjU4NTg5Nn0.R60fgoA1WVJ77a5xjJXIMB1FkcIhaJFp7D8Zfr0q5h0';

// Australian school term months (inclusive). Update start/end each year if terms shift.
const TERM_RANGES = [
  { term: 'T1', startMonth: 2,  endMonth: 4  },
  { term: 'T2', startMonth: 4,  endMonth: 7  },
  { term: 'T3', startMonth: 7,  endMonth: 9  },
  { term: 'T4', startMonth: 10, endMonth: 12 },
];

// Fallback day of week for youth night (0=Sun … 5=Fri … 6=Sat).
// In practice this is overridden per-campus from the campuses.youth_night_dow column.
const YOUTH_NIGHT_DOW_FALLBACK = 5;

// ── Supabase client ───────────────────────────────────────────────────────────
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Identity ──────────────────────────────────────────────────────────────────
// Shape: { campus_id, campus_name, leader_id, leader_name, role }

function getIdentity() {
  try {
    const raw = sessionStorage.getItem('dy_identity');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setIdentity(identity) {
  sessionStorage.setItem('dy_identity', JSON.stringify(identity));
}

function clearIdentity() {
  sessionStorage.removeItem('dy_identity');
}

// Call at the top of every protected page.
// role: 'leader' | 'pastor' | null (any role accepted)
function requireIdentity(role = null) {
  const identity = getIdentity();
  if (!identity) { window.location.href = '/'; return null; }
  if (role && identity.role !== role) { window.location.href = '/'; return null; }
  return identity;
}

// ── Date / term helpers ───────────────────────────────────────────────────────

function formatDate(date = new Date()) {
  return new Date(date).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// Returns YYYY-MM-DD string suitable for <input type="date">
function formatDateInput(date = new Date()) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Returns string like "T3 2026"
function termFromDate(date = new Date()) {
  const d     = new Date(date);
  const month = d.getMonth() + 1;
  const year  = d.getFullYear();
  for (const r of TERM_RANGES) {
    if (month >= r.startMonth && month <= r.endMonth) return `${r.term} ${year}`;
  }
  return `T4 ${year}`;
}

// Returns YYYY-MM-DD of the most recent past youth night.
// dow: day-of-week integer (0=Sun … 6=Sat), defaults to campus value or fallback.
function mostRecentYouthNight(from = new Date(), dow = YOUTH_NIGHT_DOW_FALLBACK) {
  const d    = new Date(from);
  const today = d.getDay();
  const diff  = (today >= dow) ? today - dow : 7 - (dow - today);
  d.setDate(d.getDate() - diff);
  return formatDateInput(d);
}

// Returns the youth_night_dow for the current identity (reads sessionStorage).
function getCampusDow() {
  const identity = getIdentity();
  return identity?.youth_night_dow ?? YOUTH_NIGHT_DOW_FALLBACK;
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function showError(msg, containerId = 'error-banner') {
  console.error('[DY]', msg);
  const el = document.getElementById(containerId);
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}

function hideError(containerId = 'error-banner') {
  const el = document.getElementById(containerId);
  if (el) el.classList.add('hidden');
}

function setLoading(el, loading) {
  if (!el) return;
  el.disabled = loading;
  el.dataset.originalText = el.dataset.originalText ?? el.textContent;
  el.textContent = loading ? 'Loading…' : el.dataset.originalText;
}

// ── Data helpers ──────────────────────────────────────────────────────────────

// Check for duplicate new_people by name + phone
async function checkDuplicateNP(name, phone, excludeId = null) {
  if (!phone) return null;
  let query = db.from('new_people')
    .select('id, name, phone, status, campus_id')
    .ilike('name', name.trim())
    .eq('phone', phone.trim());
  if (excludeId) query = query.neq('id', excludeId);
  const { data } = await query.limit(1);
  return data?.[0] ?? null;
}

// Activate a new person → creates youth_roster record, updates NP status
async function activateNewPerson(npId) {
  const { data: np, error: fetchErr } = await db
    .from('new_people')
    .select('*')
    .eq('id', npId)
    .single();
  if (fetchErr) throw fetchErr;

  const { data: youth, error: rosterErr } = await db
    .from('youth_roster')
    .insert({
      leader_id:  np.leader_id,
      campus_id:  np.campus_id,
      name:       np.name,
      year_level: np.year_level,
      gender:     np.gender,
      category:   'community',
    })
    .select()
    .single();
  if (rosterErr) throw rosterErr;

  const { error: updateErr } = await db
    .from('new_people')
    .update({ status: 'activated', activated_date: formatDateInput() })
    .eq('id', npId);
  if (updateErr) throw updateErr;

  return youth;
}

// Compute attendance stats from an array of leader_entries for a term
function computeAttendanceStats(entries) {
  const active = entries.filter(e => !e.no_youth_night);
  if (!active.length) return { avg: 0, expectedAvg: 0, rate: 0 };

  let totalAttended = 0, totalExpected = 0;
  for (const entry of active) {
    const listing = entry.attendance_listing ?? [];
    totalAttended += listing.filter(r => r.status === 'yes' || r.status === 'maybe').length;
    totalExpected += listing.filter(r => r.status === 'yes').length;
  }
  const weeks = active.length;
  return {
    avg:         +(totalAttended / weeks).toFixed(1),
    expectedAvg: +(totalExpected  / weeks).toFixed(1),
    rate:        totalExpected ? Math.round((totalAttended / totalExpected) * 100) : 0,
  };
}

// Check if a youth has 3+ consecutive 'no' entries across the last N entries
function hasAbsenceFlag(youthId, entries) {
  const sorted = [...entries].sort((a, b) => b.entry_date.localeCompare(a.entry_date));
  let streak = 0;
  for (const entry of sorted) {
    const row = (entry.attendance_listing ?? []).find(r => r.youth_id === youthId);
    if (!row) break;
    if (row.status === 'no') { streak++; if (streak >= 3) return true; }
    else break;
  }
  return false;
}

// ── Planning Centre (V2 hook) ─────────────────────────────────────────────────
// Replace these stubs with real PCO API calls when V2 integration is enabled.
const planningCentre = {
  async getAttendance(/* campusId, date */) { return null; },
  async getServices(/* campusId, from, to */) { return []; },
};

// ── Global export ─────────────────────────────────────────────────────────────
window.DY = {
  db,
  getIdentity, setIdentity, clearIdentity, requireIdentity,
  formatDate, formatDateInput, termFromDate, mostRecentYouthNight, getCampusDow,
  showError, hideError, setLoading,
  checkDuplicateNP, activateNewPerson,
  computeAttendanceStats, hasAbsenceFlag,
  planningCentre,
};
