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
     lessonDays  the lessons finished (or repeated) on each day: { '2026-10-21': [1, 2] }
     run       a repeat run in progress: { lesson, seen } or null
     notes     the practice journal: [{ id, day, time, text, rating, lesson }]
     noteDays  how many notes have scored points on each day: { '2026-10-21': 2 }

   POINTS (decided for Step 6):
     10 for finishing a lesson (reaching its last page)
      5 for ticking a Your turn exercise (first time only)
      3 for coming back on a new day
      5 for repeating a lesson you have finished before (see "Repeat runs" below)
      5 for filling every page of a Practice page the first time (beats.js, practice)
      2 for filling them again after "Do it again", once a day for each Practice page
   Points are never taken away: unticking does not remove them.
   A journal note scores 5 points (rated 1, "just practising") or 8 (rated 2,
   "something outstanding"). Only the FIRST TWO notes of each day score. Extra
   notes are free and add nothing. Editing or deleting a note never changes
   points (so deleting and rewriting cannot earn twice).
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
  return { v: 1, points: 0, pending: [], awarded: {}, done: [], last: null, ticks: {}, lastDay: null, run: null, lessonDays: {}, notes: [], noteDays: {} };
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
/* Remember that a lesson was finished (or repeated) today. The calendar's "lesson only" dot reads this. */
function logLesson(lesson) {
  const day = todayText();
  const list = state.lessonDays[day] || (state.lessonDays[day] = []);
  if (!list.includes(lesson)) list.push(lesson);
  saveProgress();
}

/* ---------- Repeat runs ----------
   Repeating a lesson you have already finished pays 5 points, but only for a FRESH run:
     - it starts when you open page 1,
     - every page after that is turned to in order (going back is allowed, skipping ahead is not),
     - it pays when the last page is reached, and then the run is over.
   So continuing a lesson from the middle, or bouncing back and forth at the end,
   earns nothing. To earn again, go back to page 1. The run is saved (state.run), so a
   page reload does not lose it. */
function trackRun(lesson, page, total) {
  const r = state.run;
  if (page === 1) state.run = { lesson: lesson, seen: 1 };                         // a fresh start
  else if (r && r.lesson === lesson && page === r.seen + 1) r.seen = page;        // the next page in order
  else if (r && r.lesson === lesson && page <= r.seen) { /* same page or back: keep the run */ }
  else state.run = null;                                                           // skipped, or came in mid-lesson
  if (state.run && total > 1 && state.run.seen === total) {
    award('repeat' + lesson + '-' + Date.now(), 5, 'Lesson ' + lesson + ' again');
    logLesson(lesson);
    state.run = null;                                                              // paid: the run is over
  }
}

function noteVisit(lesson, page, total) {
  state.last = { lesson: lesson, page: page };
  if (state.done.includes(lesson)) trackRun(lesson, page, total);   // a lesson finished before: this may be a repeat
  else state.run = null;                                            // a first time through is not a repeat
  if (page === total && !state.done.includes(lesson)) {
    state.done.push(lesson);
    award('lesson' + lesson, 10, 'Lesson ' + lesson + ' finished');
    logLesson(lesson);
  }
  saveProgress();
}

/* ---------- Ticks ---------- */
const isTicked = key => !!state.ticks[key];
function setTick(key, on) {
  if (on) state.ticks[key] = 1; else delete state.ticks[key];
  saveProgress();
}

/* ---------- The practice journal ----------
   Points for a rating (numbers to tune later) and how many notes score per day. */
const NOTE_POINTS = { 1: 5, 2: 8 };
const NOTES_SCORED_PER_DAY = 2;

/* Save a new note. Returns { note, scored }: scored is true if it earned points. */
function addNote(text, rating, lesson) {
  const now = new Date();
  const two = x => String(x).padStart(2, '0');
  const day = todayText();
  const note = {
    id: String(now.getTime()),                     // the moment it was written: unique enough
    day: day,
    time: two(now.getHours()) + ':' + two(now.getMinutes()),
    text: text,
    rating: rating,
    lesson: lesson || null                          // the lesson it was written from, if any
  };
  /* Count scored notes per day in its own record, so deleting a note and writing
     another cannot earn the same points twice. */
  const used = state.noteDays[day] || 0;
  let scored = false;
  if (used < NOTES_SCORED_PER_DAY) {
    scored = true;
    state.noteDays[day] = used + 1;
    award('note' + note.id, NOTE_POINTS[rating], 'Journal note');
  }
  state.notes.push(note);
  saveProgress();
  return { note: note, scored: scored };
}
/* Change a note's words or rating. Points stay as they were. */
function editNote(id, text, rating) {
  const note = state.notes.find(n => n.id === id);
  if (note) { note.text = text; note.rating = rating; saveProgress(); }
}
/* Delete a note. Points already given stay. */
function deleteNote(id) {
  state.notes = state.notes.filter(n => n.id !== id);
  saveProgress();
}

/* ---------- Calendar data ----------
   dayInfo(day): what happened on one day, and its ONE mark (the strongest):
     'empty' nothing, 'dot' a lesson only, 'light' a note, 'dense' an outstanding note. */
function dayInfo(day) {
  const notes = state.notes.filter(n => n.day === day);
  const lessons = state.lessonDays[day] || [];
  let mark = 'empty';
  if (lessons.length) mark = 'dot';
  if (notes.length) mark = notes.some(n => n.rating === 2) ? 'dense' : 'light';
  return { day: day, notes: notes, lessons: lessons, mark: mark };
}

/* The longest run of days in a row that have any mark. Returns { len, days }, where
   days is a Set of the day texts in that run. A run of one day is not shown (len < 2
   gives an empty set). If two runs tie, the most recent one wins. */
function longestRun() {
  const toNum = d => { const [y, m, dd] = d.split('-').map(Number); return Date.UTC(y, m - 1, dd) / 86400000; };
  const marked = [...new Set([...state.notes.map(n => n.day), ...Object.keys(state.lessonDays)])].sort();
  let best = [], run = [];
  marked.forEach((d, i) => {
    if (i > 0 && toNum(d) - toNum(marked[i - 1]) === 1) run.push(d); else run = [d];
    if (run.length >= best.length) best = run.slice();        // ">=" so a later run wins a tie
  });
  return { len: best.length, days: best.length >= 2 ? new Set(best) : new Set() };
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
