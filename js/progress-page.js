/* =====================================================================
   progress-page.js  (the Your progress page, first part)
   book.js calls buildProgress() when the address bar says #progress.
   Built so far (wireframe 5): your level, today, your year (the calendar strip), and
   the practice journal. Still to come: the level path, your records, Download my notes.
   Needs progress.js (state, levels), journal.js (the notes), contents.js (makeDot),
   collect.js (openCollect) and book.js (make, render).
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
  wrap.append(level);

  /* ---- Today: two pips, filled as notes score ---- */
  const today = progressSection('Today', 'pr-today');
  const scored = state.noteDays[todayText()] || 0;
  const pips = make('div', 'pips');
  for (let i = 0; i < NOTES_SCORED_PER_DAY; i++) pips.append(makeDot(i < scored, false));
  pips.append(make('span', 'note', scored + ' of ' + NOTES_SCORED_PER_DAY + ' scored notes today. Extra notes are always welcome and add no points.'));
  today.append(pips);
  wrap.append(today);

  /* The notes for the picked day (today until you pick another) sit in the journal below.
     The calendar fills this box when a day is clicked. */
  const notesBox = make('div', 'day-notes');

  /* ---- Your year: the calendar strip ---- */
  const year = progressSection('Your year', 'pr-year');
  year.append(buildYear(notesBox));
  wrap.append(year);

  /* ---- Practice journal: the Add-note button, then the notes for the picked day ---- */
  const journal = progressSection('Practice journal', 'pr-journal');
  /* The same button and pop-up box as on the Practice and Reflect pages. No lesson tag
     here. The page redraws when a note is saved, and again after the points are collected. */
  journal.append(makeNoteButton(null, null, render, render));
  journal.append(notesBox);
  showDayNotes(notesBox, calPick || todayText(), render);
  wrap.append(journal);
  return wrap;
}
