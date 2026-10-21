/* =====================================================================
   progress.js  (saved progress, points and levels)
   Replaces the Step 5 stand-in (visit.js). Everything lives in ONE save
   in the browser's localStorage, under the key 'pencave-progress'.
   The save has a version number (v) so that accounts, or a changed format,
   can be added later without losing anyone's progress.

   WHAT IS SAVED (the shape of the save, like a C# class with fields):
     v         version of this format (1)
     points    points COLLECTED so far (the running total, nothing else)
     pending   awards waiting for the Collect box: [{ label, pts }]
     awarded   ids already paid out, so nothing pays twice: { id: 1 }
     done      lesson numbers whose last page has been reached
     last      the bookmark: { lesson, page }
     ticks     ticked boxes: { 'seed text': 1 }
     lastDay   the last calendar day the reader visited, e.g. '2026-10-21'

   POINTS (decided for Step 6):
     10 for finishing a lesson (reaching its last page)
      5 for ticking a Your turn exercise (first time only)
      3 for coming back on a new day
   Points are never taken away: unticking does not remove them.
   Only the running total is stored, so the level numbers below can be
   changed later and every save still works.

   Wrapped in try/catch: some browsers refuse storage (private windows).
   Then the site simply forgets, which is harmless.
   ===================================================================== */

/* The levels. "at" = points needed. Numbers are a draft, tuned later.
   Level 6 (Challenge counters) is not here yet: its points are still to decide. */
const LEVELS = [
  { n: 1, at: 0,   unlock: 'The whole book and lesson checklists' },
  { n: 2, at: 30,  unlock: 'Timer for timed drills' },
  { n: 3, at: 80,  unlock: 'Pomodoro and graph paper' },
  { n: 4, at: 150, unlock: 'Daily warm-up generator' },
  { n: 5, at: 250, unlock: 'Printable sheets and drafting vellum' }
];

const PROGRESS_KEY = 'pencave-progress';
const OLD_VISIT_KEY = 'pencave-visit';   // the Step 5 stand-in; read once, so nobody loses their place

/* An empty save. */
function freshProgress() {
  return { v: 1, points: 0, pending: [], awarded: {}, done: [], last: null, ticks: {}, lastDay: null };
}

/* Read the save. If there is none (or it is damaged), start empty. */
function loadProgress() {
  try {
    const p = JSON.parse(localStorage.getItem(PROGRESS_KEY));
    if (p && p.v === 1 && Array.isArray(p.done)) return Object.assign(freshProgress(), p);
  } catch (e) { /* nothing saved, or storage refused */ }
  const p = freshProgress();
  try {   // carry over the old Step 5 memory, if it exists
    const old = JSON.parse(localStorage.getItem(OLD_VISIT_KEY));
    if (old && Array.isArray(old.done)) { p.done = old.done; p.last = old.last || null; }
  } catch (e) { /* ignore */ }
  return p;
}

const state = loadProgress();   // the save, kept in memory while the page is open

function saveProgress() {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

/* Today's date as text, in the reader's own time zone: '2026-10-21'. */
function todayText() {
  const d = new Date();
  const two = x => String(x).padStart(2, '0');
  return d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate());
}

/* ---------- Awards ----------
   An award goes into "pending" until the reader presses Collect.
   The id makes sure the same thing never pays twice. */
function award(id, pts, label) {
  if (state.awarded[id]) return false;
  state.awarded[id] = 1;
  state.pending.push({ label: label, pts: pts });
  saveProgress();
  return true;
}
const pendingTotal = () => state.pending.reduce((sum, a) => sum + a.pts, 0);

/* Move every pending award into the running total. Returns the points added. */
function collectPoints() {
  const added = pendingTotal();
  state.points += added;
  state.pending = [];
  saveProgress();
  updateBar();
  return added;
}

/* ---------- Levels ----------
   levelInfo(points) says which level a total is, what comes next, and how far
   along the bar is (0 to 1) between this level and the next. */
function levelInfo(points) {
  let idx = 0;
  LEVELS.forEach((l, i) => { if (points >= l.at) idx = i; });
  const now = LEVELS[idx], next = LEVELS[idx + 1] || null;
  return {
    level: now.n,
    unlock: now.unlock,
    next: next,                                                   // null at the top level
    toNext: next ? next.at - points : 0,
    frac: next ? (points - now.at) / (next.at - now.at) : 1
  };
}

/* ---------- Tidiness of the pencil lines ----------
   The lines start sketchy (style C) and settle toward clean (style A) as the
   reader puts in effort. Two ways, as the owner asked:
     1. Slowly: every level reached tidies the lines one step (levels 1 to 5
        give steps 0 to 4 of 5). Points come from effort, so repeating pays.
     2. Fully: once EVERY lesson in the book has been finished, the lines are
        fully clean (step 5). Opening the book again then looks like style A.
   It is never announced. The same value is used on every page, so the look
   does not jump around while you move through the book. */
function inkLevel() {
  const lessons = Object.keys(window.PENCAVE_LESSONS).map(Number);
  if (lessons.length && lessons.every(n => state.done.includes(n))) return 5;
  return levelInfo(state.points).level - 1;
}

/* ---------- Visits ----------
   noteDay(): the first visit on a new day pays 3 points (never on the very first day).
   noteVisit(): remember the bookmark; reaching the last page finishes the lesson. */
function noteDay() {
  const today = todayText();
  if (state.lastDay && state.lastDay !== today) award('day' + today, 3, 'Back on a new day');
  state.lastDay = today;
  saveProgress();
}
function noteVisit(lesson, page, total) {
  state.last = { lesson: lesson, page: page };
  if (page === total && !state.done.includes(lesson)) {
    state.done.push(lesson);
    award('lesson' + lesson, 10, 'Lesson ' + lesson + ' finished');
  }
  saveProgress();
}

/* ---------- Ticks ---------- */
const isTicked = key => !!state.ticks[key];
function setTick(key, on) {
  if (on) state.ticks[key] = 1; else delete state.ticks[key];
  saveProgress();
}

/* ---------- The top bar ----------
   Shows the COLLECTED points only, so a level-up is first seen in the Collect box. */
function updateBar() {
  const info = levelInfo(state.points);
  const text = document.querySelector('.level-text');
  const num = document.querySelector('.avatar-n');
  const link = document.querySelector('.bar-right');
  if (text) text.textContent = 'Level ' + info.level + ' · ' + state.points + ' pts';
  if (num) num.textContent = info.level;
  if (link) link.setAttribute('aria-label', 'Level ' + info.level + ', ' + state.points + ' points');
}
