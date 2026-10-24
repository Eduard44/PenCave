/* =====================================================================
   pomodoro-page.js  (the Pomodoro page, #pomodoro)
   book.js calls buildPomodoroPage() when the address bar says #pomodoro. Like the Timer page it
   is not a book page (no ribbon, no Previous or Next) and it is OPTIONAL to visit: the chip in the
   top bar (pomodoro.js) starts, pauses and shows it from every other page. It runs alongside the Timer.

   Below Level 3 the page shows the LOCKED version (wireframe 6 E).

   The clock lives in pomodoro.js. This page only shows it and calls its buttons:
   pomoStart, pomoPause, pomoSkip, pomoReset, pomoSetting.
   Needs pomodoro.js, timer.js (timerText), sounds.js, progress.js (state, LEVELS),
   journal.js (makeNoteButton), book.js (make, render).
   ===================================================================== */

/* ---------- Below Level 3: the locked page ---------- */
function buildPomodoroLocked(wrap) {
  const need = LEVELS.find(l => l.n === POMO_LEVEL).at;            // 80 points
  const box = make('div', 'locked-tile');
  box.dataset.drawn = 'dashed';
  box.dataset.color = 'rule';
  box.dataset.seed = 'pomo-locked';
  box.append(make('p', 'locked-title', 'Unlocks at Level ' + POMO_LEVEL + ' · ' + need + ' points'));
  const row = make('div', 'locked-row');
  const bar = make('div', 'locked-bar');
  bar.dataset.drawn = 'bar';
  bar.dataset.value = Math.min(1, state.points / need);
  bar.dataset.seed = 'pomo-locked-bar';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', String(need));
  bar.setAttribute('aria-valuenow', String(Math.min(state.points, need)));
  bar.setAttribute('aria-label', 'Points towards Level ' + POMO_LEVEL);
  row.append(bar, make('span', 'note', state.points + ' of ' + need));
  box.append(row);
  wrap.append(box);
  wrap.append(make('p', 'note', 'Nothing in the lessons is locked.'));
  wrap.append(make('p', 'note', 'Learning methods: coming soon'));
  return wrap;
}

/* The settings: the label shown, the key saved, and the words after the number. */
const POMO_FIELDS = [
  { key: 'focus',  label: 'Focus (minutes)' },
  { key: 'brk',    label: 'Break (minutes)' },
  { key: 'long',   label: 'Long break (minutes)' },
  { key: 'rounds', label: 'Rounds' }
];

/* ---------- The Pomodoro page ---------- */
function buildPomodoroPage() {
  const wrap = make('div', 'timer-page pomodoro-page');           // shares the Timer page's look
  wrap.append(make('p', 'eyebrow', 'Level ' + POMO_LEVEL + ' tool · focus, then a short break'));
  wrap.append(make('h1', 'page-title', 'Pomodoro'));
  if (!pomoUnlocked()) return buildPomodoroLocked(wrap);

  /* ---- Which part we are in, the big time, and the round ---- */
  const phase = make('p', 'pomo-phase');
  wrap.append(phase);
  const display = make('div', 'timer-display');
  display.dataset.drawn = 'box';
  display.dataset.seed = 'pomo-display';
  display.setAttribute('role', 'timer');
  wrap.append(display);
  const round = make('p', 'note pomo-round');
  wrap.append(round);
  const status = make('p', 'note timer-status');
  status.setAttribute('aria-live', 'polite');
  wrap.append(status);

  /* ---- Start / Pause / Skip / Reset ---- */
  const start = make('button', 'btn', 'Start');
  const pause = make('button', 'btn', 'Pause');
  const skip = make('button', 'btn', 'Skip');
  const reset = make('button', 'btn', 'Reset');
  [[start, 'pm-start'], [pause, 'pm-pause'], [skip, 'pm-skip'], [reset, 'pm-reset']].forEach(p => { p[0].type = 'button'; p[0].dataset.drawn = 'box'; p[0].dataset.seed = p[1]; });
  start.addEventListener('click', pomoStart);
  pause.addEventListener('click', pomoPause);
  skip.addEventListener('click', pomoSkip);
  reset.addEventListener('click', pomoReset);
  const actions = make('div', 'row timer-actions');
  actions.append(start, pause, skip, reset);
  wrap.append(actions);
  wrap.append(make('p', 'note', 'Runs alongside the Timer.'));

  /* ---- Settings: four whole numbers. A change is saved when you leave the box or press Enter,
          and it stops and resets the Pomodoro (like picking a new time on the Timer). ---- */
  wrap.append(make('h2', 'pomo-settings-title', 'Settings'));
  const grid = make('div', 'settings-grid');
  const inputs = {};
  const msg = make('p', 'note');
  msg.setAttribute('role', 'alert');
  msg.hidden = true;
  POMO_FIELDS.forEach(f => {
    const cell = make('div', 'settings-cell');
    const label = make('label', 'field-label', f.label);
    label.htmlFor = 'pomo-' + f.key;
    const box = make('div', 'field custom-field');
    box.dataset.drawn = 'box';
    box.dataset.seed = 'pomo-field-' + f.key;
    const input = make('input', 'name-input');
    input.id = 'pomo-' + f.key;
    input.type = 'number';
    input.min = String(POMO_LIMITS[f.key][0]);
    input.max = String(POMO_LIMITS[f.key][1]);
    input.step = '1';
    input.inputMode = 'numeric';
    input.addEventListener('change', () => {
      const n = Number(input.value);
      if (input.value.trim() !== '' && n === pomoData[f.key]) { msg.hidden = true; return; }   // nothing changed: do not reset
      if (input.value.trim() === '' || !pomoSetting(f.key, n)) {
        msg.textContent = f.label.replace(' (minutes)', '') + ': enter a whole number from ' + POMO_LIMITS[f.key][0] + ' to ' + POMO_LIMITS[f.key][1] + '.';
        msg.hidden = false;
        input.value = String(pomoData[f.key]);                 // put the saved number back
        return;
      }
      msg.hidden = true;
    });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.dispatchEvent(new Event('change')); } });
    box.append(input);
    cell.append(label, box);
    grid.append(cell);
    inputs[f.key] = input;
  });
  wrap.append(grid, msg);
  wrap.append(make('p', 'note', 'A common starting point. Change it to suit you. Changing a setting stops and resets the Pomodoro.'));

  /* ---- Two sounds: when focus ends, and when a break ends ---- */
  const soundNames = {};
  [['focus', 'Sound when focus ends'], ['brk', 'Sound when a break ends']].forEach(s => {
    wrap.append(make('p', 'field-label', s[1]));
    const row = make('div', 'row');
    const name = make('strong', '', soundLabel(pomoData.sounds[s[0]].choice));
    const change = make('button', 'btn', 'Change');
    change.type = 'button';
    change.dataset.drawn = 'box';
    change.dataset.seed = 'pm-sound-' + s[0];
    change.setAttribute('aria-label', 'Change: ' + s[1].toLowerCase());
    change.addEventListener('click', () => openSoundBox(
      () => { name.textContent = soundLabel(pomoData.sounds[s[0]].choice); },
      { snd: pomoData.sounds[s[0]], save: savePomo, title: s[1] }));
    row.append(name, change);
    wrap.append(row);
    soundNames[s[0]] = name;
  });

  /* The Learning methods page does not exist yet, so plain grey words, not a link. */
  wrap.append(make('p', 'note pomo-about', 'About this method: coming soon'));

  /* ---- The same journal button as everywhere (no lesson tag) ---- */
  wrap.append(makeNoteButton(null, null, null, render));

  /* ---- Keeping the page in step with the clock ---- */
  let seen = '';
  function refresh(force) {
    if (force !== true && !document.body.contains(wrap)) return false;     // we left this page: stop listening
    const d = pomoData;
    display.textContent = timerText(pomoLeft());
    display.setAttribute('aria-label', timerText(pomoLeft()) + ' left');
    const words = { idle: '', running: 'Running.', paused: 'Paused.',
      done: d.phase === 'focus' ? 'Focus is done.' : d.phase === 'break' ? 'The break is over.' : 'Set complete.' }[d.status];
    if (status.textContent !== words) status.textContent = words;

    const running = d.status === 'running', done = d.status === 'done';
    const key = [d.status, d.phase, d.round, d.focus, d.brk, d.long, d.rounds].join('|');
    if (key === seen && force !== true) return true;
    seen = key;

    phase.textContent = pomoPhaseName(d.phase);
    round.textContent = 'round ' + d.round + ' of ' + d.rounds;
    start.textContent = d.status === 'paused' ? 'Resume' : 'Start';
    start.disabled = running || done;
    pause.disabled = !running;
    skip.disabled = !(running || d.status === 'paused');
    reset.disabled = d.status === 'idle' && d.phase === 'focus' && d.round === 1;
    const main = (btn, on) => { btn.classList.toggle('primary', on); if (on) btn.dataset.fill = 'solid'; else delete btn.dataset.fill; };
    main(start, !running);
    main(pause, running);

    POMO_FIELDS.forEach(f => { if (document.activeElement !== inputs[f.key]) inputs[f.key].value = String(d[f.key]); });
    drawAll(); watchAll();
    return true;
  }
  onPomoChange(refresh);
  refresh(true);
  return wrap;
}
