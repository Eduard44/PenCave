/* =====================================================================
   timer.js  (the Timer: its clock, its saved settings, and the chip in the top bar)
   The Timer is a Level 2 tool. This file holds everything that does not depend on
   which page is open, so the clock keeps running while you turn pages.

   HOW IT KEEPS TIME
   We never count seconds ourselves. When the Timer starts we save the END TIME
   (a moment on the clock, "endAt"). Every quarter second we ask "how long until
   endAt?". That way a slow or busy page cannot make the Timer drift, and a page
   reload cannot lose it. (In C# terms: store a DateTime, not a counter.)

   SAVED IN THE BROWSER, in its own key "pencave-timer" (it is NOT part of the
   progress save, so the save file and the point rules are untouched):
     { v, minutes, label, status, endAt, remaining, sound: { choice, volume } }
     status:    'idle' (ready), 'running', 'paused', or 'done' (time is up, not yet ok'd)
     minutes:   the time chosen, in whole minutes (1 to 120)
     remaining: milliseconds left (used when idle or paused)
     endAt:     when it ends, as a clock time in milliseconds (used when running)
     sound:     the end sound (see sounds.js)

   Needs progress.js (state, levelInfo), book.js (make), sounds.js (alarmStart, alarmStop).
   ===================================================================== */

const TIMER_KEY = 'pencave-timer';
const TIMER_MIN = 1, TIMER_MAX = 120;     // the Custom box accepts whole minutes from 1 to 120
const TIMER_LEVEL = 2;                    // the level that unlocks the Timer

/* A fresh timer: 10 minutes, ready, Soft chime at 70% volume. */
function freshTimer() {
  return { v: 1, minutes: 10, label: '', status: 'idle', endAt: 0, remaining: 10 * 60000, sound: { choice: 'chime', volume: 70 } };
}

/* Read the saved timer. If it is missing or damaged, start fresh. */
function loadTimer() {
  const t = freshTimer();
  try {
    const p = JSON.parse(localStorage.getItem(TIMER_KEY));
    if (p && p.v === 1 && typeof p.minutes === 'number') {
      Object.assign(t, p);
      t.sound = Object.assign(freshTimer().sound, p.sound || {});
    }
  } catch (e) { /* nothing saved, or storage refused: use the fresh timer */ }
  /* Keep the numbers sane even if the saved text was edited by hand. */
  t.minutes = Math.min(TIMER_MAX, Math.max(TIMER_MIN, Math.round(t.minutes) || 10));
  if (!['idle', 'running', 'paused', 'done'].includes(t.status)) t.status = 'idle';
  if (typeof t.label !== 'string') t.label = '';
  /* The page was closed while the Timer ran, and the time has passed since: it is done.
     (A sound only plays while a page is open, so there is none now.) */
  if (t.status === 'running' && t.endAt <= Date.now()) { t.status = 'done'; t.remaining = 0; }
  return t;
}

const timerData = loadTimer();            // the timer, kept in memory while the page is open

function saveTimer() {
  try { localStorage.setItem(TIMER_KEY, JSON.stringify(timerData)); } catch (e) { /* storage refused: ignore */ }
}

/* ---------- Reading the clock ---------- */

/* Milliseconds left right now. */
function timerLeft() {
  if (timerData.status === 'running') return Math.max(0, timerData.endAt - Date.now());
  if (timerData.status === 'done') return 0;
  return timerData.remaining;
}

/* Milliseconds -> "04:32" (minutes can go past 99: "120:00"). Whole seconds, rounded UP, so
   "00:00" only shows when the time is really up. */
function timerText(ms) {
  const total = Math.ceil(ms / 1000);
  return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
}

/* Is the Timer unlocked? It uses COLLECTED points, like the top bar does. */
const timerUnlocked = () => levelInfo(state.points).level >= TIMER_LEVEL;

/* ---------- What the buttons do ---------- */

function timerStart() {
  if (timerData.status === 'running') return;
  timerAlarmStop();                      // starting again ends a finished Timer's alarm
  if (timerData.status === 'done' || timerData.status === 'idle') timerData.remaining = timerData.minutes * 60000;
  timerData.endAt = Date.now() + timerData.remaining;
  timerData.status = 'running';
  saveTimer();
  startTicking();
  timerChanged();
}

function timerPause() {
  if (timerData.status !== 'running') return;
  timerData.remaining = Math.max(0, timerData.endAt - Date.now());
  timerData.status = 'paused';
  saveTimer();
  timerChanged();
}

/* Reset: stop, and go back to the chosen time. */
function timerReset() {
  timerAlarmStop();                      // (also what "ok" does, through timerAck)
  timerData.status = 'idle';
  timerData.remaining = timerData.minutes * 60000;
  saveTimer();
  timerChanged();
}

/* Pick a time (a chip or the Custom box). Stops the Timer and shows the new time. Returns false
   if the number is not a whole number from 1 to 120. */
function timerSetMinutes(n) {
  if (!Number.isInteger(n) || n < TIMER_MIN || n > TIMER_MAX) return false;
  timerData.minutes = n;
  timerReset();
  return true;
}

function timerSetLabel(text) {
  timerData.label = String(text).slice(0, 24);
  saveTimer();
  timerChanged();
}

/* "ok" on a finished Timer: back to ready. */
function timerAck() {
  if (timerData.status === 'done') {
    timerReset();
    if (typeof pomoResumeAlarm === 'function') pomoResumeAlarm();   // pomodoro.js: if a Pomodoro alarm was also waiting, it keeps ringing
  }
}

/* ---------- The alarm and its pop-up ----------
   When the time is up the sound repeats (sounds.js) and a "Timer done" box opens, until the
   learner presses OK (the box, the chip's "ok", or Esc). The box is a built-in <dialog> opened
   with showModal(). Browsers stack these: a box opened later sits ON TOP of the ones already
   open and leaves them untouched. So if a Collect box or an Add-note box is open when the time
   runs out, they stay exactly as they are underneath, and are there again after OK. */
function timerDoneBox() {
  let box = document.getElementById('timer-done');
  if (!box) {
    box = make('dialog', 'collect-box');                  // same look as the Collect box
    box.id = 'timer-done';
    box.setAttribute('aria-label', 'Timer done');
    const body = make('div', 'timer-done-body');
    body.dataset.drawn = 'box';
    body.dataset.fill = 'paper';
    body.dataset.seed = 'timer-done';
    box.append(body);
    document.body.append(box);
    box.body = body;
    /* Closing it any way at all (OK, or the Esc key) means "turn it off". */
    box.addEventListener('close', () => { if (timerData.status === 'done') timerAck(); });
  }
  return box;
}

function timerAlarmStart() {
  alarmStart();                                           // sounds.js
  const box = timerDoneBox(), body = box.body;
  const name = timerData.label ? timerData.label + ' · ' : '';
  body.replaceChildren(
    make('h3', '', 'Timer done'),
    make('p', 'collect-points', timerData.minutes + (timerData.minutes === 1 ? ' minute' : ' minutes')),
    make('p', 'note', name + 'Time is up.' + (timerData.sound.choice === 'off' ? '' : ' The sound repeats until you press OK.'))
  );
  const ok = make('button', 'btn primary', 'OK');
  ok.type = 'button';
  ok.dataset.drawn = 'box';
  ok.dataset.fill = 'solid';
  ok.dataset.seed = 'timer-done-ok';
  ok.addEventListener('click', timerAck);
  const row = make('div', 'collect-actions');
  row.append(ok);
  body.append(row);
  /* If the learner is typing in a box right now (a journal note, say), do NOT put the focus on
     OK, or a space or Enter they type could press it by accident. The heading takes the focus. */
  const heading = body.querySelector('h3');
  heading.tabIndex = -1;
  const a = document.activeElement;
  const typing = a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);
  if (!box.open) box.showModal();
  drawAll(); watchAll();
  (typing ? heading : ok).focus();
}

function timerAlarmStop() {
  alarmStop();                                            // sounds.js: ends the repeating and cuts the sound
  const box = document.getElementById('timer-done');
  if (box && box.open) box.close();
}

/* ---------- The ticking ----------
   Every 250 ms: see if time is up, then tell whoever is showing the clock. The ticking only
   runs while the Timer is running, so an idle Timer costs nothing. */
let tickHandle = null;
function startTicking() {
  if (tickHandle) return;
  tickHandle = setInterval(() => {
    if (timerData.status === 'running' && timerData.endAt <= Date.now()) {
      timerData.status = 'done';
      timerData.remaining = 0;
      saveTimer();
      timerAlarmStart();                       // the sound repeats and the pop-up opens, until OK
    }
    if (timerData.status !== 'running') { clearInterval(tickHandle); tickHandle = null; }
    timerChanged();
  }, 250);
}

/* Things that show the clock (the chip, the Timer page) add a function here. A function
   that returns false is dropped: that is how a page that was left stops listening. */
const timerViews = [];
function onTimerChange(fn) { timerViews.push(fn); }
function timerChanged() {
  for (let i = timerViews.length - 1; i >= 0; i--) if (timerViews[i]() === false) timerViews.splice(i, 1);
}

/* ---------- The chip in the top bar ----------
   Wireframe 8: "Timer 10:00  start". The name and time open the Timer page; "start" and
   "pause" run it with the settings used last. It only exists from Level 2. The words
   change as the Timer runs; we only change the TEXT inside, never rebuild the box, so the
   pencil box round it is not redrawn every second. */
let chip = null;   // { box, link, name, time, act, ok }
let chipListening = false;   // is refreshTimerChip already on the listener list?

function updateTimerChip() {
  const mid = document.querySelector('.bar-mid');
  if (!mid) return;
  if (!timerUnlocked()) {                      // below Level 2: no chip
    if (chip) { chip.box.remove(); chip = null; }
    return;
  }
  if (chip && !mid.contains(chip.box)) chip = null;
  if (!chip) {
    const box = make('div', 'quick');
    box.dataset.drawn = 'box';
    box.dataset.seed = 'timer-chip';
    const half = make('span', 'q-half');
    const link = make('a', 'q-link');          // name + time: opens the Timer page
    link.href = '#timer';
    const name = make('span', 'tool-name');
    const time = make('span', 'q-time');
    link.append(name, time);
    const act = make('button', 'qa');          // start / pause
    act.type = 'button';
    const ok = make('button', 'qa');           // ok, after the time is up
    ok.type = 'button';
    ok.textContent = 'ok';
    act.addEventListener('click', () => { if (timerData.status === 'running') timerPause(); else timerStart(); });
    ok.addEventListener('click', timerAck);
    half.append(link, act, ok);
    box.append(half);
    mid.append(box);
    chip = { box: box, link: link, name: name, time: time, act: act, ok: ok };
    if (!chipListening) { onTimerChange(refreshTimerChip); chipListening = true; }
    drawAll(); watchAll();
  }
  refreshTimerChip();
}

/* Put the right words in the chip for the Timer's state. */
function refreshTimerChip() {
  if (!chip || !document.body.contains(chip.box)) { chipListening = false; return false; }     // false: drop this listener
  const t = timerData, done = t.status === 'done';
  /* While it runs (or is paused) the name you gave it shows in place of "Timer". */
  const shown = (t.status === 'running' || t.status === 'paused') && t.label ? t.label : 'Timer';
  chip.name.textContent = done ? 'Timer done' : shown;
  chip.time.textContent = done ? '' : timerText(timerLeft());
  chip.act.textContent = t.status === 'running' ? 'pause' : 'start';
  chip.act.hidden = done;
  chip.ok.hidden = !done;
  chip.link.setAttribute('aria-label', done ? 'Timer done. Open the Timer' : 'Timer, ' + timerText(timerLeft()) + '. Open the Timer');
  chip.act.setAttribute('aria-label', (t.status === 'running' ? 'Pause' : 'Start') + ' the Timer');
  chip.ok.setAttribute('aria-label', 'Timer done: ok');
  return true;
}

/* The Timer may have been running when the page opened. */
if (timerData.status === 'running') startTicking();
