/* =====================================================================
   progress-page.js  (the Your progress page, first part)
   book.js calls buildProgress() when the address bar says #progress.
   Built (wireframe 5), in two columns.
     Left:  your level, today, your year (the calendar strip), the practice journal,
            and the Save file block (save-file.js).
     Right: Levels (every level, boxed rows), Your records, How your data is kept.
   On a narrow screen the right column goes underneath.
   Needs progress.js (state, levels), journal.js (the notes), contents.js (makeDot),
   collect.js (openCollect), save-file.js (recordStats, buildSaveBlock) and book.js (make, render).
   ===================================================================== */

/* A section: a heading with a pencil line under it. */
function progressSection(title, seed) {
  const sec = make('section', 'progress-section');
  sec.append(make('h2', '', title));
  const rule = make('span', 'h-rule');
  rule.dataset.drawn = 'rule';
  rule.dataset.seed = seed;
  sec.append(rule);
  return sec;
}

function buildProgress() {
  const wrap = make('div', 'progress-page');
  wrap.append(make('h1', 'page-title', 'Your progress'));
  /* Two columns: the sections that were here first on the left, the new ones on the right. */
  const cols = make('div', 'progress-cols');
  const left = make('div', 'progress-left');

  /* ---- Level: where you are, a drawn bar to the next level ---- */
  const info = levelInfo(state.points);
  const level = progressSection('Level ' + info.level, 'pr-level');
  level.append(make('p', '', info.next ? state.points + ' of ' + info.next.at + ' points' : state.points + ' points'));
  const bar = make('div', 'pbar');
  bar.dataset.drawn = 'bar';
  bar.dataset.value = info.frac;
  bar.dataset.seed = 'pr-bar';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.setAttribute('aria-valuenow', Math.round(info.frac * 100));
  bar.setAttribute('aria-label', info.next ? 'Progress to Level ' + info.next.n : 'Top level');
  level.append(bar);
  level.append(make('p', 'note', info.next ? 'Next: ' + info.next.unlock + ' at Level ' + info.next.n : 'The top level for now.'));
  /* Points earned but not collected yet. */
  if (state.pending.length) {
    const wait = make('button', 'btn', 'Collect ' + pendingTotal() + ' points');
    wait.type = 'button';
    wait.dataset.drawn = 'dashed';
    wait.dataset.seed = 'pr-collect';
    wait.addEventListener('click', () => openCollect(render));
    level.append(wait);
  }
  left.append(level);

  /* ---- Today: two pips, filled as notes score ---- */
  const today = progressSection('Today', 'pr-today');
  const scored = state.noteDays[todayText()] || 0;
  const pips = make('div', 'pips');
  for (let i = 0; i < NOTES_SCORED_PER_DAY; i++) pips.append(makeDot(i < scored, false));
  pips.append(make('span', 'note', scored + ' of ' + NOTES_SCORED_PER_DAY + ' scored notes today. Extra notes are always welcome and add no points.'));
  today.append(pips);
  left.append(today);

  /* The notes for the picked day (today until you pick another) sit in the journal below.
     The calendar fills this box when a day is clicked. */
  const notesBox = make('div', 'day-notes');

  /* ---- Your year: the calendar strip ---- */
  const year = progressSection('Your year', 'pr-year');
  year.append(buildYear(notesBox));
  left.append(year);

  /* ---- Practice journal: the Add-note button, then the notes for the picked day ---- */
  const journal = progressSection('Practice journal', 'pr-journal');
  /* The same button and pop-up box as on the Practice and Reflect pages. No lesson tag
     here. The page redraws when a note is saved, and again after the points are collected. */
  journal.append(makeNoteButton(null, null, render, render));
  journal.append(notesBox);
  showDayNotes(notesBox, calPick || todayText(), render);
  left.append(journal);

  /* Save file: Download my save and Load a save (save-file.js). */
  left.append(buildSaveBlock());

  cols.append(left, buildSideColumn(info));
  wrap.append(cols);
  return wrap;
}

/* ---------- The right column ---------- */

/* Level 6 (Challenge counters) is not in LEVELS (progress.js) yet, because its points are
   still to decide. It is shown here as "? pts". When level 6 is added to LEVELS, delete this. */
const LEVEL_PATH_EXTRA = [{ n: 6, at: null, unlock: 'Challenge counters' }];

/* Levels: one boxed row per level (option C, chosen by the owner).
   Reached = solid line. Your level = heavier line, and "You are here" in words.
   Later = dashed grey, with its level and points written out (never colour alone). */
function buildLevelPath(info) {
  const sec = progressSection('Levels', 'pr-levels');
  const list = make('ol', 'level-rows');
  LEVELS.concat(LEVEL_PATH_EXTRA).forEach(l => {
    const row = make('li', 'level-row');
    const reached = l.n < info.level, mine = l.n === info.level;
    row.dataset.drawn = reached || mine ? 'box' : 'dashed';
    row.dataset.seed = 'lvrow' + l.n;
    if (mine) row.dataset.weight = '3';
    if (!reached && !mine) row.classList.add('is-later');

    const lv = make('div', 'lv', 'Level ' + l.n);
    lv.append(make('small', '', l.at === null ? '? pts' : l.at + ' pts'));
    const what = make('div', 'what', l.unlock);
    if (mine) what.prepend(make('span', 'here', 'You are here'));
    row.append(lv, what);
    row.append(make('span', 'pp-sr', reached ? 'Reached.' : mine ? 'Your level.' : 'Not reached yet.'));
    list.append(row);
  });
  sec.append(list);
  sec.append(make('p', 'note', 'More themes and methods to come.'));
  return sec;
}

/* Your records: four numbers (recordStats is in save-file.js). */
function buildRecords() {
  const r = recordStats();
  const sec = progressSection('Your records', 'pr-records');
  const dl = make('dl', 'records');
  [
    ['Longest run', r.run ? plural(r.run, 'day') : 'none yet'],
    ['Lessons finished', r.finished + ' of ' + r.total],
    ['Notes written', String(r.notes)],
    ['Days practised', String(r.days)]
  ].forEach(pair => {
    const box = make('div');
    box.append(make('dt', '', pair[0]), make('dd', '', pair[1]));
    dl.append(box);
  });
  sec.append(dl);
  sec.append(make('p', 'note', 'All kept in this browser.'));
  return sec;
}

/* How your data is kept: a small line that opens. The words are the owner's to write. */
function buildDataKept() {
  const wrap = make('div', 'progress-section kept-wrap');
  const d = make('details', 'kept');
  d.append(make('summary', '', 'How your data is kept'));
  d.append(make('p', 'note', '[YOUR TEXT HERE: how your data is kept. Everything stays in this browser and PenCave holds no copy.]'));
  wrap.append(make('p', 'note', 'Saved in this browser only.'), d);
  return wrap;
}

/* The whole right column, with its drawn line on the left. */
function buildSideColumn(info) {
  const side = make('div', 'progress-side');
  const rule = make('span', 'side-rule');
  rule.dataset.drawn = 'vrule';
  rule.dataset.seed = 'pr-side';
  side.append(rule, buildLevelPath(info), buildRecords(), buildDataKept());
  return side;
}
