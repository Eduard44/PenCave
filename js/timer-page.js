/* =====================================================================
   timer-page.js  (the Timer page, #timer)
   book.js calls buildTimerPage() when the address bar says #timer. A tool page is not a
   book page: no ribbon, no Previous or Next. The Timer is OPTIONAL to visit: the chip in
   the top bar (timer.js) starts, pauses and shows it from every other page.

   Below Level 2 the page shows the LOCKED version (wireframe 6 E): what unlocks it, how
   far along you are, and that nothing in the lessons is locked.

   The clock itself lives in timer.js. This page only shows it, and calls its buttons:
   timerStart, timerPause, timerReset, timerSetMinutes, timerSetLabel.
   Needs timer.js, sounds.js, progress.js (state, LEVELS), journal.js (makeNoteButton),
   book.js (make, render).
   ===================================================================== */

const TIMER_CHIPS = [1, 5, 10, 15, 30];     // the quick times, in minutes. "Custom" comes after them.

/* ---------- Below Level 2: the locked page ---------- */
function buildTimerLocked(wrap) {
  const need = LEVELS.find(l => l.n === TIMER_LEVEL).at;           // 30 points
  const box = make('div', 'locked-tile');
  box.dataset.drawn = 'dashed';
  box.dataset.color = 'rule';
  box.dataset.seed = 'timer-locked';
  box.append(make('p', 'locked-title', 'Unlocks at Level ' + TIMER_LEVEL + ' · ' + need + ' points'));

  const row = make('div', 'locked-row');
  const bar = make('div', 'locked-bar');
  bar.dataset.drawn = 'bar';
  bar.dataset.value = Math.min(1, state.points / need);
  bar.dataset.seed = 'timer-locked-bar';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', String(need));
  bar.setAttribute('aria-valuenow', String(Math.min(state.points, need)));
  bar.setAttribute('aria-label', 'Points towards Level ' + TIMER_LEVEL);
  row.append(bar, make('span', 'note', state.points + ' of ' + need));
  box.append(row);
  wrap.append(box);

  wrap.append(make('p', 'note', 'Nothing in the lessons is locked.'));
  /* The Learning methods page does not exist yet, so this is plain words, not a link. */
  wrap.append(make('p', 'note', 'Learning methods: coming soon'));
  return wrap;
}

/* ---------- The Timer page ---------- */
function buildTimerPage() {
  const wrap = make('div', 'timer-page');
  wrap.append(make('p', 'eyebrow', 'Level ' + TIMER_LEVEL + ' tool · for timed drills'));
  wrap.append(make('h1', 'page-title', 'Timer'));
  if (!timerUnlocked()) return buildTimerLocked(wrap);

  /* ---- The big time, and a line saying what it is doing ---- */
  const display = make('div', 'timer-display');
  display.dataset.drawn = 'box';
  display.dataset.seed = 'timer-display';
  display.setAttribute('role', 'timer');
  wrap.append(display);
  const status = make('p', 'note timer-status');
  status.setAttribute('aria-live', 'polite');
  wrap.append(status);

  /* ---- Set the time (minutes): the chips, one picked at a time, and Custom ---- */
  wrap.append(make('p', 'field-label', 'Set the time (minutes)'));
  const chipRow = make('div', 'row');
  chipRow.setAttribute('role', 'group');
  chipRow.setAttribute('aria-label', 'Set the time in minutes');
  const chipButtons = [];
  const makeChip = (label, seed, onClick) => {
    const b = make('button', 'btn chip', label);
    b.type = 'button';
    b.dataset.drawn = 'box';
    b.dataset.seed = seed;
    b.addEventListener('click', onClick);
    chipRow.append(b);
    chipButtons.push(b);
    return b;
  };
  TIMER_CHIPS.forEach(n => makeChip(String(n), 'chip' + n, () => { customOpen = false; timerSetMinutes(n); }));
  let customOpen = false;
  const customChip = makeChip('Custom', 'chipc', () => { customOpen = true; refresh(true); input.focus(); });
  wrap.append(chipRow);

  /* Custom: a box for whole minutes from 1 to 120. */
  const custom = make('div', 'custom-row');
  const customLabel = make('label', 'field-label', 'Minutes (1 to ' + TIMER_MAX + ')');
  customLabel.htmlFor = 'timer-custom';
  const inputWrap = make('div', 'field custom-field');
  inputWrap.dataset.drawn = 'box';
  inputWrap.dataset.seed = 'timer-custom';
  const input = make('input', 'name-input');
  input.id = 'timer-custom';
  input.type = 'number';
  input.min = String(TIMER_MIN);
  input.max = String(TIMER_MAX);
  input.step = '1';
  input.inputMode = 'numeric';
  inputWrap.append(input);
  const setBtn = make('button', 'btn', 'Set');
  setBtn.type = 'button';
  setBtn.dataset.drawn = 'box';
  setBtn.dataset.seed = 'custom-set';
  const customMsg = make('p', 'note');
  customMsg.setAttribute('role', 'alert');
  customMsg.hidden = true;
  const applyCustom = () => {
    const n = Number(input.value);
    if (input.value.trim() === '' || !timerSetMinutes(n)) {
      customMsg.textContent = 'Enter a whole number from ' + TIMER_MIN + ' to ' + TIMER_MAX + '.';
      customMsg.hidden = false;
      return;
    }
    customMsg.hidden = true;
  };
  setBtn.addEventListener('click', applyCustom);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); applyCustom(); } });
  const customLine = make('div', 'row');
  customLine.append(inputWrap, setBtn);
  custom.append(customLabel, customLine, customMsg);
  custom.hidden = true;
  wrap.append(custom);

  /* ---- Start / Pause / Reset ---- */
  const start = make('button', 'btn', 'Start');
  const pause = make('button', 'btn', 'Pause');
  const reset = make('button', 'btn', 'Reset');
  [[start, 'tm-start'], [pause, 'tm-pause'], [reset, 'tm-reset']].forEach(p => { p[0].type = 'button'; p[0].dataset.drawn = 'box'; p[0].dataset.seed = p[1]; });
  start.addEventListener('click', timerStart);
  pause.addEventListener('click', timerPause);
  reset.addEventListener('click', timerReset);
  const actions = make('div', 'row timer-actions');
  actions.append(start, pause, reset);
  wrap.append(actions);

  /* ---- Add a name to your timer (optional) ---- */
  const nameLabel = make('label', 'field-label', 'Add a name to your timer (optional)');
  nameLabel.htmlFor = 'timer-name';
  const nameWrap = make('div', 'field name-field');
  nameWrap.dataset.drawn = 'box';
  nameWrap.dataset.seed = 'timer-name';
  const nameInput = make('input', 'name-input');
  nameInput.id = 'timer-name';
  nameInput.type = 'text';
  nameInput.maxLength = 24;
  nameInput.value = timerData.label;
  nameInput.addEventListener('input', () => timerSetLabel(nameInput.value));
  nameWrap.append(nameInput);
  wrap.append(nameLabel, nameWrap, make('p', 'note', 'Shown in the top bar while it runs.'));

  /* ---- Sound at the end ---- */
  wrap.append(make('p', 'field-label', 'Sound at the end'));
  const soundRow = make('div', 'row');
  const soundName = make('strong', '', soundLabel(timerData.sound.choice));
  const change = make('button', 'btn', 'Change');
  change.type = 'button';
  change.dataset.drawn = 'box';
  change.dataset.seed = 'tm-sound';
  change.setAttribute('aria-label', 'Change the sound at the end');
  change.addEventListener('click', () => openSoundBox(() => { soundName.textContent = soundLabel(timerData.sound.choice); }));
  soundRow.append(soundName, change);
  wrap.append(soundRow);

  /* ---- The same journal button as everywhere (no lesson tag) ---- */
  wrap.append(makeNoteButton(null, null, null, render));

  /* ---- Keeping the page in step with the clock ----
     refresh() runs on every tick. Cheap things (the time, the words) update every time; the
     drawn boxes are only redrawn when something about them really changed. */
  let seen = '';
  function refresh(force) {
    /* The very first call (force === true) happens before the page is on the screen, so only later calls check. */
    if (force !== true && !document.body.contains(wrap)) return false;   // we left this page: stop listening
    const t = timerData;
    display.textContent = timerText(timerLeft());
    display.setAttribute('aria-label', timerText(timerLeft()) + ' left');
    const words = { idle: '', running: 'Running.', paused: 'Paused.', done: 'Time is up.' }[t.status];
    if (status.textContent !== words) status.textContent = words;

    const running = t.status === 'running';
    const isPreset = TIMER_CHIPS.includes(t.minutes);
    const key = [t.status, t.minutes, customOpen].join('|');
    if (key === seen && force !== true) return true;
    seen = key;

    /* Start (or Resume) is the main button when the Timer is not running; Pause is, while it runs. */
    start.textContent = t.status === 'paused' ? 'Resume' : 'Start';
    start.disabled = running;
    pause.disabled = !running;
    reset.disabled = t.status === 'idle';
    const main = (btn, on) => { btn.classList.toggle('primary', on); if (on) btn.dataset.fill = 'solid'; else delete btn.dataset.fill; };
    main(start, !running);
    main(pause, running);

    chipButtons.forEach((b, i) => {
      const picked = i < TIMER_CHIPS.length ? (!customOpen && isPreset && t.minutes === TIMER_CHIPS[i]) : (customOpen || !isPreset);
      b.setAttribute('aria-pressed', picked ? 'true' : 'false');
    });
    custom.hidden = !(customOpen || !isPreset);
    if (!custom.hidden && document.activeElement !== input) input.value = String(t.minutes);
    drawAll(); watchAll();
    return true;
  }
  onTimerChange(refresh);
  refresh(true);
  return wrap;
}
