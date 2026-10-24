/* =====================================================================
   save-file.js  (Download my save, and Load a save)
   Lets a learner carry everything to a new phone, a new computer, or a
   browser that was cleared.

   ONE click on "Download my save" makes TWO files:
     pencave-save-2026-10-22.json   the whole save. This is the one you LOAD back.
     pencave-notes-2026-10-22.txt   a plain readable copy. Not loaded, just read.
                                    The learner picks which parts go in it (all on to start).
   "Load a save" reads a .json file. If this browser already has progress, a box
   asks first, and the safe answer ("No, keep what I have") is the solid button.

   This file only READS and WRITES the save through the functions in progress.js
   (state, saveProgress, freshProgress, levelInfo, longestRun). It changes none of
   the rules there. Needs book.js (make, render), journal.js (dayLabel), draw.js.
   ===================================================================== */

/* ---------- Small shared helpers ---------- */

/* The numbers shown under "Your records" and written into the .txt file.
   In C# terms: a little method that returns a record of values. */
function recordStats() {
  const total = Object.keys(window.PENCAVE_LESSONS).length;
  const finished = state.done.filter(n => window.PENCAVE_LESSONS[n]).length;
  /* A "day practised" is any day with a mark: a note or a finished lesson. */
  const days = new Set([...state.notes.map(n => n.day), ...Object.keys(state.lessonDays)]);
  return { run: longestRun().len, finished: finished, total: total, notes: state.notes.length, days: days.size };
}

/* "2026-10-22" -> "22 October 2026" */
function longDate(day) {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* "1 day", "3 days" */
const plural = (n, word) => n + ' ' + word + (n === 1 ? '' : 's');

/* ---------- Making the two files ---------- */

/* The .json file. The "pencave" and "fileVersion" lines let PenCave recognise its own
   file later. "progress" is a copy of the whole save (see the top of progress.js). */
function buildSaveJson() {
  return JSON.stringify({
    pencave: 'save-file',
    fileVersion: 1,
    about: 'A PenCave save file. Load it on the Your progress page to carry your progress to another browser.',
    savedAt: new Date().toISOString(),
    seen: true,                                   // so a loaded browser does not show the first screen again
    progress: JSON.parse(JSON.stringify(state))   // a copy, so nothing here can change the live save
  }, null, 2);
}

/* The readable .txt file. "parts" says which pieces to include:
   { level: true, lessons: true, records: true, notes: true } */
function buildNotesText(parts) {
  const out = ['PenCave · my notes', 'Saved on ' + longDate(todayText()), ''];

  if (parts.level) {
    const info = levelInfo(state.points);
    out.push('LEVEL AND POINTS');
    out.push('Level ' + info.level + ' · ' + plural(state.points, 'point'));
    if (info.next) out.push(plural(info.toNext, 'more point') + ' to Level ' + info.next.n + '.');
    if (state.pending.length) out.push('Points waiting to be collected: ' + pendingTotal());
    out.push('');
  }

  if (parts.lessons) {
    const r = recordStats();
    out.push('LESSONS FINISHED');
    out.push(r.finished + ' of ' + r.total);
    state.done.slice().sort((a, b) => a - b).forEach(n => {
      const l = window.PENCAVE_LESSONS[n];
      if (l) out.push('  Lesson ' + n + ' · ' + l.title);
    });
    out.push('');
  }

  if (parts.records) {
    const r = recordStats();
    out.push('RECORDS');
    out.push('Longest run: ' + (r.run ? plural(r.run, 'day') : 'none yet'));
    out.push('Days practised: ' + r.days);
    out.push('Notes written: ' + r.notes);
    out.push('');
  }

  if (parts.notes) {
    out.push('NOTES');
    if (!state.notes.length) out.push('No notes yet.');
    /* Newest day first. Within a day, the order they were written. */
    const days = [...new Set(state.notes.map(n => n.day))].sort().reverse();
    days.forEach(day => {
      const [y, m, d] = day.split('-').map(Number);
      out.push('');
      out.push(new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
      state.notes.filter(n => n.day === day).sort((a, b) => a.time.localeCompare(b.time)).forEach(n => {
        const l = n.lesson && window.PENCAVE_LESSONS[n.lesson];
        out.push('  ' + n.time + ' · ' + (n.rating === 2 ? 'Something outstanding' : 'Just practising') + (l ? ' · Lesson ' + l.number + ' · ' + l.title : ''));
        n.text.split('\n').forEach(line => out.push('    ' + line));
      });
    });
    out.push('');
  }

  out.push('This is a readable copy. To restore your progress, load the .json file on the Your progress page.');
  return out.join('\n');
}

/* Hand a piece of text to the browser as a download. */
function downloadText(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type: type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/* ---------- Reading a save file back ---------- */

const isPlainObject = x => !!x && typeof x === 'object' && !Array.isArray(x);

/* Check a file's text. Returns { ok: true, progress } or { ok: false, why }.
   We only accept what looks exactly like a PenCave save, so a wrong file cannot damage anything. */
function readSaveFile(text) {
  let obj;
  try { obj = JSON.parse(text); } catch (e) { return { ok: false, why: 'This file is not a PenCave save.' }; }
  if (!isPlainObject(obj) || obj.pencave !== 'save-file') return { ok: false, why: 'This file is not a PenCave save.' };
  if (obj.fileVersion !== 1) return { ok: false, why: 'This save was made by a different version of PenCave, so it cannot be loaded here.' };
  const p = obj.progress;
  const good = isPlainObject(p) && p.v === 1
    && typeof p.points === 'number' && isFinite(p.points) && p.points >= 0
    && Array.isArray(p.done) && p.done.every(n => typeof n === 'number')
    && Array.isArray(p.pending) && p.pending.every(a => isPlainObject(a) && typeof a.label === 'string' && typeof a.pts === 'number')
    && Array.isArray(p.notes) && p.notes.every(n => isPlainObject(n) && /^\d{4}-\d{2}-\d{2}$/.test(n.day) && typeof n.text === 'string' && typeof n.time === 'string' && (n.rating === 1 || n.rating === 2))
    && [p.awarded, p.ticks, p.lessonDays, p.noteDays].every(isPlainObject);
  if (!good) return { ok: false, why: 'This save file looks damaged, so nothing was loaded.' };
  return { ok: true, progress: Object.assign(freshProgress(), p), savedAt: obj.savedAt || '' };
}

/* Does this browser already hold some progress of its own? */
function hasProgress(s) {
  return s.points > 0 || s.pending.length > 0 || s.done.length > 0 || s.notes.length > 0
      || Object.keys(s.lessonDays).length > 0 || Object.keys(s.ticks).length > 0;
}

/* One line describing a save: "Level 2 · 34 points · 5 notes · 2 lessons finished". */
function describeSave(s) {
  return 'Level ' + levelInfo(s.points).level + ' · ' + plural(s.points, 'point') + ' · ' + plural(s.notes.length, 'note') + ' · ' + plural(s.done.length, 'lesson') + ' finished';
}

/* Put a loaded save in place of the live one. "state" is a constant object, so we empty it and
   refill it (the same object, new contents), then save it and redraw the page. */
function replaceSave(progress) {
  Object.keys(state).forEach(k => delete state[k]);
  Object.assign(state, progress);
  saveProgress();
  markSeen();                 // book.js: no first screen after a restore
  updateBar();
  render();
}

/* ---------- The small boxes (built-in <dialog>, same look as the note box) ---------- */
function saveBox() {
  let box = document.getElementById('save-box');
  if (!box) {
    box = make('dialog', 'collect-box note-box');
    box.id = 'save-box';
    box.setAttribute('aria-label', 'Load a save');
    const body = make('div', 'note-body save-box-body');
    body.dataset.drawn = 'box';
    body.dataset.fill = 'paper';
    body.dataset.seed = 'save-box';
    box.append(body);
    document.body.append(box);
    box.body = body;
  }
  return box;
}

/* A box button. "main" makes it the solid one. */
function boxButton(label, seed, main, onClick) {
  const b = make('button', 'btn' + (main ? ' primary' : ''), label);
  b.type = 'button';
  b.dataset.drawn = 'box';
  if (main) b.dataset.fill = 'solid';
  b.dataset.seed = seed;
  b.addEventListener('click', onClick);
  return b;
}

/* Show a message with a Done button (used for "loaded" and for a bad file). */
function showSaveMessage(title, lines) {
  const box = saveBox();
  box.body.replaceChildren(make('h3', '', title));
  lines.forEach(t => box.body.append(make('p', '', t)));
  const row = make('div', 'jrow');
  const done = boxButton('Done', 'save-done', true, () => box.close());
  row.append(done);
  box.body.append(row);
  if (!box.open) box.showModal();
  drawAll(); watchAll();
  done.focus();
}

/* Ask before replacing. The safe choice is the solid button and has the focus; Esc also keeps. */
function askToReplace(found) {
  const box = saveBox();
  box.body.replaceChildren(
    make('h3', '', 'This browser already has progress'),
    make('p', '', 'Here now: ' + describeSave(state)),
    make('p', '', 'In the file: ' + describeSave(found.progress)),
    make('p', '', 'Loading the file replaces what is here. Do you want to replace it?')
  );
  const row = make('div', 'jrow');
  const keep = boxButton('No, keep what I have', 'save-keep', true, () => box.close());
  const yes = boxButton('Yes, replace it', 'save-yes', false, () => {
    replaceSave(found.progress);
    showSaveMessage('Save loaded', [describeSave(state)]);
  });
  row.append(keep, yes);
  box.body.append(row);
  box.showModal();
  drawAll(); watchAll();
  keep.focus();
}

/* A file was chosen: read it, check it, then load it (asking first if needed). */
function handleChosenFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const found = readSaveFile(String(reader.result));
    if (!found.ok) { showSaveMessage('That file did not load', [found.why, 'Nothing was changed.']); return; }
    if (hasProgress(state)) { askToReplace(found); return; }
    replaceSave(found.progress);
    showSaveMessage('Save loaded', [describeSave(state)]);
  };
  reader.onerror = () => showSaveMessage('That file did not load', ['The file could not be read.', 'Nothing was changed.']);
  reader.readAsText(file);
}

/* ---------- The "Save file" block on Your progress ---------- */

/* The four parts of the readable file, each with a tick. All on to start, as the owner asked. */
const NOTES_PARTS = [
  { key: 'level',   label: 'Level and points' },
  { key: 'lessons', label: 'Lessons finished' },
  { key: 'records', label: 'Records' },
  { key: 'notes',   label: 'All my notes, with dates' }
];

/* THE DOWNLOAD ITSELF, in one place, so it can be started from anywhere (the Save file block,
   the Privacy page, the Erase box) without leaving the page you are on.
   "parts" says which parts go in the readable .txt (see NOTES_PARTS); if none is on, only the
   .json downloads. Returns the sentence to show the learner. */
function downloadSaveNow(parts) {
  const day = todayText();
  const jsonName = 'pencave-save-' + day + '.json';
  const txtName = 'pencave-notes-' + day + '.txt';
  downloadText(jsonName, buildSaveJson(), 'application/json');
  if (NOTES_PARTS.some(p => parts[p.key])) {
    /* A short pause, because some browsers refuse two downloads at the very same moment. */
    setTimeout(() => downloadText(txtName, buildNotesText(parts), 'text/plain'), 400);
    return 'Downloaded ' + jsonName + ' and ' + txtName + '. If your browser asks to allow more than one download, choose Allow.';
  }
  return 'Downloaded ' + jsonName + '. Nothing is ticked, so there is no readable notes file.';
}

/* Everything on, for the "Download my notes" links outside the Save file block. */
const allNotesParts = () => Object.fromEntries(NOTES_PARTS.map(p => [p.key, true]));

function buildSaveBlock() {
  const sec = progressSection('Save file', 'pr-save');             // progress-page.js
  sec.classList.add('save-block');
  sec.append(make('p', '', 'Everything is kept in this browser only. A save file lets you carry your progress to a phone, another computer, or a browser that was cleared.'));

  /* Which parts go in the readable .txt. Not saved anywhere: all on each visit. */
  const on = {};
  NOTES_PARTS.forEach(p => { on[p.key] = true; });
  const status = make('p', 'note save-status');
  status.setAttribute('aria-live', 'polite');

  sec.append(make('p', 'note save-parts-label', 'The readable notes file (.txt) includes:'));
  const group = make('div', 'save-parts');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Parts of the readable notes file');
  NOTES_PARTS.forEach(p => {
    const row = make('div', 'save-part');
    const tick = make('button', 'tick tick-corner');
    tick.type = 'button';
    tick.setAttribute('aria-pressed', 'true');
    tick.setAttribute('aria-label', p.label);
    tick.dataset.drawn = 'box';
    tick.dataset.seed = 'savepart-' + p.key;
    const icon = make('i', 'icon');
    icon.dataset.icon = 'tick';
    tick.append(icon);
    const flip = () => {
      on[p.key] = !on[p.key];
      tick.setAttribute('aria-pressed', on[p.key] ? 'true' : 'false');
      status.textContent = '';
      drawAll();
    };
    tick.addEventListener('click', flip);
    const words = make('span', 'save-part-text', p.label);
    words.addEventListener('click', flip);                         // the words toggle it too
    row.append(tick, words);
    group.append(row);
  });
  sec.append(group);

  /* The two buttons. */
  const dl = make('button', 'btn', 'Download my save');
  dl.type = 'button';
  dl.dataset.drawn = 'box';
  dl.dataset.seed = 'save-dl';
  const load = make('button', 'btn', 'Load a save');
  load.type = 'button';
  load.dataset.drawn = 'box';
  load.dataset.seed = 'save-load';
  const row = make('div', 'jrow save-buttons');
  row.append(dl, load);
  sec.append(row, status);

  /* The hidden file picker that "Load a save" opens. */
  const input = make('input');
  input.type = 'file';
  input.id = 'save-file-input';
  input.accept = '.json,application/json';
  input.hidden = true;
  input.addEventListener('change', () => { handleChosenFile(input.files[0]); input.value = ''; });
  sec.append(input);
  load.addEventListener('click', () => input.click());

  dl.addEventListener('click', () => { status.textContent = downloadSaveNow(on); });
  return sec;
}
