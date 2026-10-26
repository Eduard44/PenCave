/* =====================================================================
   pomodoro.js  (the Pomodoro: its clock, its saved settings, and the chip in the top bar)
   The Pomodoro is a Level 3 tool: focus for a while, then a short break, round after round.
   It works like the Timer (timer.js) and RUNS ALONGSIDE it: they are two separate tools with
   two separate saves. This file does not depend on which page is open, so the clock keeps
   running while you turn pages.

   THE ROUNDS (with the usual 25 / 5 / 20 / 4)
       Focus 1 -> Break -> Focus 2 -> Break -> Focus 3 -> Break -> Focus 4 -> Long break -> "Set complete"
   When a part ends, the sound repeats and a pop-up opens until the reader presses OK; OK starts
   the next part by itself. After the long break the pop-up says "Set complete" and asks if they
   would like another set (Yes starts round 1 again; No goes back to ready).

   HOW IT KEEPS TIME: like the Timer, we save the END TIME (endAt) and every quarter second ask
   "how long until endAt?". A busy page cannot make it drift and a reload cannot lose it.

   SAVED IN THE BROWSER in its own key "pencave-pomodoro" (NOT in the progress save, so the save
   file and the point rules are untouched):
     { v, focus, brk, long, rounds, phase, round, status, endAt, remaining, sounds }
     focus / brk / long   minutes for each part (focus 1-120, breaks 1-60)
     rounds               how many focus rounds in a set (1-12)
     phase                'focus', 'break' or 'long'
     round                which round we are in (1 to rounds)
     status               'idle' (ready), 'running', 'paused' or 'done' (time is up, not yet ok'd)
     sounds               { focus: {choice, volume}, brk: {choice, volume} }: the sound when a
                          focus round ends, and the sound when a break ends (see sounds.js)

   Needs progress.js (state, levelInfo), book.js (make), sounds.js (alarmStart, alarmStop).
   ===================================================================== */

const POMO_KEY = 'pencave-pomodoro';
const POMO_LEVEL = 3;                                   // the level that unlocks the Pomodoro
/* The allowed whole numbers: [lowest, highest]. */
const POMO_LIMITS = { focus: [1, 120], brk: [1, 60], long: [1, 60], rounds: [1, 12] };

function freshPomo() {
  return {
    v: 1, focus: 25, brk: 5, long: 20, rounds: 4,
    phase: 'focus', round: 1, status: 'idle', endAt: 0, remaining: 25 * 60000,
    sounds: { focus: { choice: 'chime', volume: 70 }, brk: { choice: 'chime', volume: 70 } }
  };
}

/* Minutes for a part of the set. */
function pomoMinutes(d, phase) { return phase === 'focus' ? d.focus : phase === 'break' ? d.brk : d.long; }

function loadPomo() {
  const d = freshPomo();
  try {
    const p = JSON.parse(localStorage.getItem(POMO_KEY));
    if (p && p.v === 1 && typeof p.focus === 'number') {
      Object.assign(d, p);
      const fresh = freshPomo();
      d.sounds = { focus: Object.assign(fresh.sounds.focus, (p.sounds || {}).focus), brk: Object.assign(fresh.sounds.brk, (p.sounds || {}).brk) };
    }
  } catch (e) { /* nothing saved, or storage refused: use the fresh one */ }
  /* Keep every number sane even if the saved text was edited by hand. */
  Object.keys(POMO_LIMITS).forEach(k => {
    const [lo, hi] = POMO_LIMITS[k];
    d[k] = Math.min(hi, Math.max(lo, Math.round(d[k]) || freshPomo()[k]));
  });
  if (!['focus', 'break', 'long'].includes(d.phase)) d.phase = 'focus';
  d.round = Math.min(d.rounds, Math.max(1, Math.round(d.round) || 1));
  if (!['idle', 'running', 'paused', 'done'].includes(d.status)) d.status = 'idle';
  if (d.status === 'running' && d.endAt <= Date.now()) { d.status = 'done'; d.remaining = 0; }   // time passed while the page was closed
  if (d.status === 'idle') d.remaining = pomoMinutes(d, d.phase) * 60000;
  return d;
}

const pomoData = loadPomo();

function savePomo() {
  try { localStorage.setItem(POMO_KEY, JSON.stringify(pomoData)); } catch (e) { /* storage refused: ignore */ }
}

const pomoUnlocked = () => levelInfo(state.points).level >= POMO_LEVEL;

/* Milliseconds left right now. */
function pomoLeft() {
  if (pomoData.status === 'running') return Math.max(0, pomoData.endAt - Date.now());
  if (pomoData.status === 'done') return 0;
  return pomoData.remaining;
}

/* The words for the part we are in: 'Focus', 'Break' or 'Long break'. */
const pomoPhaseName = phase => phase === 'focus' ? 'Focus' : phase === 'break' ? 'Break' : 'Long break';

/* The sound that rings when a part ends: focus has one, both kinds of break share the other. */
const pomoSoundFor = phase => phase === 'focus' ? pomoData.sounds.focus : pomoData.sounds.brk;

/* What comes after the part we are in: { phase, round }, or null when the set is over. */
function pomoNext() {
  const d = pomoData;
  if (d.phase === 'focus') return { phase: d.round < d.rounds ? 'break' : 'long', round: d.round };
  if (d.phase === 'break') return { phase: 'focus', round: d.round + 1 };
  return null;
}

/* ---------- What the buttons do ---------- */

/* Begin a part right now, running. */
function pomoBegin(phase, round) {
  const d = pomoData;
  d.phase = phase; d.round = round;
  d.remaining = pomoMinutes(d, phase) * 60000;
  d.endAt = Date.now() + d.remaining;
  d.status = 'running';
  savePomo();
  pomoStartTicking();
  pomoChanged();
}

function pomoStart() {
  const d = pomoData;
  if (d.status === 'running' || d.status === 'done') return;
  if (d.status === 'idle') d.remaining = pomoMinutes(d, d.phase) * 60000;
  d.endAt = Date.now() + d.remaining;
  d.status = 'running';
  savePomo();
  pomoStartTicking();
  pomoChanged();
}

function pomoPause() {
  const d = pomoData;
  if (d.status !== 'running') return;
  d.remaining = Math.max(0, d.endAt - Date.now());
  d.status = 'paused';
  savePomo();
  pomoChanged();
}

/* Reset: stop, and go back to round 1 of focus, ready. */
function pomoReset() {
  const d = pomoData;
  d.phase = 'focus'; d.round = 1; d.status = 'idle';
  d.remaining = d.focus * 60000;
  savePomo();
  pomoAlarmStop();
  pomoChanged();
}

/* Skip: jump to the next part now (no alarm). Skipping the long break ends the set. */
function pomoSkip() {
  const d = pomoData;
  if (d.status !== 'running' && d.status !== 'paused') return;
  const next = pomoNext();
  if (next) { pomoBegin(next.phase, next.round); return; }
  d.status = 'done'; d.remaining = 0;
  savePomo();
  pomoAlarmStart(true);                       // the "Set complete" question, without a sound
  pomoChanged();
}

/* Change one setting ('focus', 'brk', 'long' or 'rounds'). Stops and resets the Pomodoro, like
   picking a new time on the Timer. Returns false if the number is not allowed. */
function pomoSetting(key, n) {
  const lim = POMO_LIMITS[key];
  if (!lim || !Number.isInteger(n) || n < lim[0] || n > lim[1]) return false;
  pomoData[key] = n;
  pomoReset();
  return true;
}

/* "OK" on a part that ended: start the next one, or (after the long break) say no to another set. */
function pomoAck() {
  const d = pomoData;
  if (d.status !== 'done') return;
  const next = pomoNext();
  pomoAlarmStop();
  if (next) pomoBegin(next.phase, next.round); else pomoReset();
  pomoResumeTimerAlarm();
}

/* "Yes, another set": round 1 again, running. */
function pomoAnotherSet() {
  if (pomoData.status !== 'done') return;
  pomoAlarmStop();
  pomoBegin('focus', 1);
  pomoResumeTimerAlarm();
}

/* If the Timer was also waiting for its OK, its alarm should keep ringing (sounds.js has one shared alarm). */
function pomoResumeTimerAlarm() {
  if (timerData.status === 'done') alarmStart();
}
/* ... and the other way round: called by timer.js when the Timer's OK is pressed. */
let pomoSilent = false;
function pomoResumeAlarm() {
  if (pomoData.status === 'done' && !pomoSilent) alarmStart(pomoSoundFor(pomoData.phase));
}

/* The own sound was removed: any Pomodoro sound set to it goes back to the chime. */
function pomoOwnSoundRemoved() {
  ['focus', 'brk'].forEach(k => { if (pomoData.sounds[k].choice === 'own') pomoData.sounds[k].choice = 'chime'; });
  savePomo();
}

/* ---------- The alarm and its pop-up ----------
   Same idea as the Timer's: a built-in <dialog> that opens ON TOP of anything already open
   (a Collect box, an Add-note box) and leaves it untouched. Closing it any way (OK, Esc)
   means "ok". At the end of a set it asks about another set instead. */
function pomoDoneBox() {
  let box = document.getElementById('pomodoro-done');
  if (!box) {
    box = make('dialog', 'collect-box');
    box.id = 'pomodoro-done';
    box.setAttribute('aria-label', 'Pomodoro');
    const body = make('div', 'timer-done-body');
    body.dataset.drawn = 'box';
    body.dataset.fill = 'paper';
    body.dataset.seed = 'pomodoro-done';
    box.append(body);
    document.body.append(box);
    box.body = body;
    box.addEventListener('close', () => { if (pomoData.status === 'done') pomoAck(); });
  }
  return box;
}

function pomoButton(label, seed, main, onClick) {
  const b = make('button', main ? 'btn primary' : 'btn', label);
  b.type = 'button';
  b.dataset.drawn = 'box';
  if (main) b.dataset.fill = 'solid';
  b.dataset.seed = seed;
  b.addEventListener('click', onClick);
  return b;
}

function pomoAlarmStart(silent) {
  const d = pomoData, snd = pomoSoundFor(d.phase);
  pomoSilent = !!silent;
  if (!silent) alarmStart(snd);                           // sounds.js: repeats until stopped
  const box = pomoDoneBox(), body = box.body;
  const ring = !silent && snd.choice !== 'off' ? ' The sound repeats until you press OK.' : '';
  const row = make('div', 'collect-actions');
  let focusThis;
  if (d.phase === 'focus') {
    const last = d.round >= d.rounds;
    body.replaceChildren(make('h3', '', 'Focus done'),
      make('p', 'collect-points', 'Round ' + d.round + ' of ' + d.rounds),
      make('p', 'note', (last ? 'OK starts your long break.' : 'OK starts your break.') + ring));
    focusThis = pomoButton('OK', 'pomo-ok', true, pomoAck);
    row.append(focusThis);
  } else if (d.phase === 'break') {
    body.replaceChildren(make('h3', '', 'Break over'),
      make('p', 'collect-points', 'Round ' + d.round + ' of ' + d.rounds),
      make('p', 'note', 'OK starts round ' + (d.round + 1) + '.' + ring));
    focusThis = pomoButton('OK', 'pomo-ok', true, pomoAck);
    row.append(focusThis);
  } else {
    body.replaceChildren(make('h3', '', 'Set complete'),
      make('p', 'collect-points', d.rounds + (d.rounds === 1 ? ' round' : ' rounds') + ' done'),
      make('p', '', 'Would you like to do another set?'),
      make('p', 'note', ring.trim()));
    focusThis = pomoButton('Yes, another set', 'pomo-yes', true, pomoAnotherSet);
    row.append(focusThis, pomoButton("No, I'm done", 'pomo-no', false, pomoAck));
  }
  body.append(row);
  /* If the reader is typing right now, the heading takes the focus, not a button. */
  const heading = body.querySelector('h3');
  heading.tabIndex = -1;
  const a = document.activeElement;
  const typing = a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);
  if (!box.open) box.showModal();
  drawAll(); watchAll();
  (typing ? heading : focusThis).focus();
}

function pomoAlarmStop() {
  alarmStop();
  const box = document.getElementById('pomodoro-done');
  if (box && box.open) box.close();
}

/* ---------- The ticking (only while it runs) ---------- */
let pomoTickHandle = null;
function pomoStartTicking() {
  if (pomoTickHandle) return;
  pomoTickHandle = setInterval(() => {
    const d = pomoData;
    if (d.status === 'running' && d.endAt <= Date.now()) {
      d.status = 'done';
      d.remaining = 0;
      savePomo();
      pomoAlarmStart(false);
    }
    if (d.status !== 'running') { clearInterval(pomoTickHandle); pomoTickHandle = null; }
    pomoChanged();
  }, 250);
}

/* Things that show the clock (the chip, the Pomodoro page) add a function here; one that
   returns false is dropped (that is how a page that was left stops listening). */
const pomoViews = [];
function onPomoChange(fn) { pomoViews.push(fn); }
function pomoChanged() {
  for (let i = pomoViews.length - 1; i >= 0; i--) if (pomoViews[i]() === false) pomoViews.splice(i, 1);
}

/* ---------- The chip in the top bar ----------
   Sits beside the Timer's chip from Level 3. Same look: "Pomodoro 25:00  start". During a
   break the name reads "Break". Only the text inside changes while it runs. */
let pomoChip = null;
let pomoChipListening = false;

function updatePomodoroChip() {
  const mid = document.querySelector('.bar-mid');
  if (!mid) return;
  if (!pomoUnlocked()) {
    if (pomoChip) { pomoChip.box.remove(); pomoChip = null; }
    return;
  }
  if (pomoChip && !mid.contains(pomoChip.box)) pomoChip = null;
  if (!pomoChip) {
    const box = make('div', 'quick');
    box.id = 'pomodoro-chip';
    box.dataset.drawn = 'box';
    box.dataset.seed = 'pomodoro-chip';
    const half = make('span', 'q-half');
    const link = make('a', 'q-link');
    link.href = '#pomodoro';
    const name = make('span', 'tool-name');
    const time = make('span', 'q-time');
    link.append(name, time);
    const act = make('button', 'qa');
    act.type = 'button';
    const ok = make('button', 'qa');
    ok.type = 'button';
    ok.textContent = 'ok';
    act.addEventListener('click', () => { if (pomoData.status === 'running') pomoPause(); else pomoStart(); });
    ok.addEventListener('click', pomoAck);
    half.append(link, act, ok);
    box.append(half);
    mid.append(box);
    pomoChip = { box: box, link: link, name: name, time: time, act: act, ok: ok };
    if (!pomoChipListening) { onPomoChange(refreshPomoChip); pomoChipListening = true; }
    drawAll(); watchAll();
  }
  refreshPomoChip();
}

function refreshPomoChip() {
  if (!pomoChip || !document.body.contains(pomoChip.box)) { pomoChipListening = false; return false; }
  const d = pomoData, done = d.status === 'done';
  const doneName = d.phase === 'focus' ? 'Focus done' : d.phase === 'break' ? 'Break over' : 'Set complete';
  const name = done ? doneName : d.phase === 'focus' ? 'Pomodoro' : pomoPhaseName(d.phase);
  pomoChip.name.textContent = name;
  pomoChip.time.textContent = done ? '' : timerText(pomoLeft());           // timerText: timer.js, mm:ss
  pomoChip.act.textContent = d.status === 'running' ? 'pause' : 'start';
  pomoChip.act.hidden = done;
  pomoChip.ok.hidden = !done;
  pomoChip.link.setAttribute('aria-label', done ? name + '. Open the Pomodoro' : name + ', ' + timerText(pomoLeft()) + '. Open the Pomodoro');
  pomoChip.act.setAttribute('aria-label', (d.status === 'running' ? 'Pause' : 'Start') + ' the Pomodoro');
  pomoChip.ok.setAttribute('aria-label', name + ': ok');
  return true;
}

/* The Pomodoro may have been running when the page opened. */
if (pomoData.status === 'running') pomoStartTicking();
