/* =====================================================================
   sounds.js  (the sound at the end of the Timer)
   Four choices, as in wireframe 6:
     Off, Soft chime, Wood tap, Low bell   made IN CODE (Web Audio): no sound files to
                                           license, so there is no copyright question.
     My own sound                          a file the learner picks (mp3, wav, ogg or m4a).
   The own sound is kept ONLY in this browser (key "pencave-own-sound"). It is never
   uploaded anywhere, and it is not in the downloaded save file. Limits (first guesses,
   to tune later): about 1 MB, and only the first 15 seconds play, with a fade-out.

   The choice and the volume live in the Timer's saved settings: timerData.sound
   = { choice: 'off' | 'chime' | 'tap' | 'bell' | 'own', volume: 0 to 100 }.
   Needs timer.js (timerData, saveTimer), book.js (make), journal.js CSS (.link-button).
   ===================================================================== */

const OWN_SOUND_KEY = 'pencave-own-sound';
const OWN_SOUND_MAX_BYTES = 1000000;     // "about 1 MB"
const OWN_SOUND_SECONDS = 15;            // only this much plays
const SOUND_CHOICES = [
  { key: 'off',   label: 'Off' },
  { key: 'chime', label: 'Soft chime' },
  { key: 'tap',   label: 'Wood tap' },
  { key: 'bell',  label: 'Low bell' },
  { key: 'own',   label: 'My own sound' }
];
const soundLabel = key => (SOUND_CHOICES.find(c => c.key === key) || SOUND_CHOICES[1]).label;

/* How many sounds have been started since the page opened (handy when testing). */
let soundPlays = 0;

/* ---------- The audio engine ----------
   One shared AudioContext (the browser's sound mixer). Browsers only allow sound after the
   person has clicked something on the page, so we make it the first time it is needed
   (Start, Test, ...) and "resume" it if the browser put it to sleep. */
let audioCtx = null;
function audioContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;                          // a very old browser: no sound
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/* A shared "bus": every sound is plugged into it, and it goes to the speakers. Cutting the bus
   (silenceAll) silences everything that is still ringing, at once. A new bus is made the next time. */
let soundBus = null;
function getBus(ctx) {
  if (!soundBus) { soundBus = ctx.createGain(); soundBus.connect(ctx.destination); }
  return soundBus;
}
function silenceAll() {
  if (soundBus) { soundBus.disconnect(); soundBus = null; }
}

/* One soft note: a sine wave that rises in a hundredth of a second, then fades away. */
function playNote(ctx, out, freq, start, length, peak, sweepTo) {
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, start);
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, start + 0.05);   // a quick drop: the "tap"
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(peak, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain); gain.connect(out);
  osc.start(start); osc.stop(start + length + 0.05);
}

/* Play one of the three built-in sounds. volume is 0 to 100. Returns how many seconds it rings. */
function playBuiltIn(choice, volume) {
  const ctx = audioContext();
  if (!ctx) return 0;
  const master = ctx.createGain();
  master.gain.value = Math.max(0, Math.min(100, volume)) / 100 * 0.6;     // 0.6: leaves headroom so it is never harsh
  master.connect(getBus(ctx));
  const t = ctx.currentTime + 0.02;
  if (choice === 'chime') {                         // two gentle notes, the second a little higher
    playNote(ctx, master, 784, t, 1.6, 0.5);
    playNote(ctx, master, 1175, t + 0.25, 1.8, 0.35);
    return 2.1;
  } else if (choice === 'tap') {                    // two short, dry knocks
    playNote(ctx, master, 700, t, 0.14, 0.9, 250);
    playNote(ctx, master, 700, t + 0.22, 0.14, 0.7, 250);
    return 0.4;
  } else if (choice === 'bell') {                   // a low note with two quieter overtones
    playNote(ctx, master, 196, t, 3.0, 0.6);
    playNote(ctx, master, 196 * 2.76, t, 2.0, 0.25);
    playNote(ctx, master, 196 * 5.4, t, 1.2, 0.12);
    return 3.0;
  }
  return 0;
}

/* ---------- The learner's own sound ---------- */

/* The saved file, or null. { name, data } where data is the file as text (a "data URL"). */
function readOwnSound() {
  try {
    const p = JSON.parse(localStorage.getItem(OWN_SOUND_KEY));
    if (p && typeof p.name === 'string' && typeof p.data === 'string') return p;
  } catch (e) { /* nothing saved */ }
  return null;
}

/* A data URL ("data:audio/mpeg;base64,AAAA...") back into raw bytes. */
function dataUrlToBytes(url) {
  const bin = atob(url.slice(url.indexOf(',') + 1));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/* Play the saved own sound: only the first 15 seconds, fading out over the last 1.5. Returns
   how many seconds it plays, or 0 if there is no file or the browser cannot play it. */
async function playOwn(volume) {
  const saved = readOwnSound(), ctx = audioContext();
  if (!saved || !ctx) return 0;
  try {
    const buffer = await ctx.decodeAudioData(dataUrlToBytes(saved.data).buffer);
    const src = ctx.createBufferSource(), gain = ctx.createGain();
    const length = Math.min(OWN_SOUND_SECONDS, buffer.duration);
    const t = ctx.currentTime + 0.02, fade = Math.min(1.5, length);
    const peak = Math.max(0, Math.min(100, volume)) / 100;
    src.buffer = buffer;
    gain.gain.setValueAtTime(peak, t);
    gain.gain.setValueAtTime(peak, t + length - fade);
    gain.gain.linearRampToValueAtTime(0, t + length);            // the fade-out
    src.connect(gain); gain.connect(getBus(ctx));
    src.start(t, 0, length);                                     // from the start, for at most 15 seconds
    return length;
  } catch (e) { return 0; }
}

/* Check and keep a chosen file. Returns { ok: true } or { ok: false, why }. */
async function saveOwnSound(file) {
  if (!/\.(mp3|wav|ogg|m4a)$/i.test(file.name)) return { ok: false, why: 'Choose an mp3, wav, ogg or m4a file.' };
  if (file.size > OWN_SOUND_MAX_BYTES) return { ok: false, why: 'That file is too large. Try one under 1 MB.' };
  const data = await new Promise(resolve => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => resolve(null);
    r.readAsDataURL(file);
  });
  if (!data) return { ok: false, why: 'That file could not be read.' };
  /* Make sure this browser can really play it, before keeping it. */
  const ctx = audioContext();
  if (ctx) {
    try { await ctx.decodeAudioData(dataUrlToBytes(data).buffer); }
    catch (e) { return { ok: false, why: 'This browser could not play that file. Try another.' }; }
  }
  try { localStorage.setItem(OWN_SOUND_KEY, JSON.stringify({ name: file.name, data: data })); }
  catch (e) { return { ok: false, why: 'This browser could not keep that file.' }; }
  return { ok: true };
}

function removeOwnSound() {
  try { localStorage.removeItem(OWN_SOUND_KEY); } catch (e) { /* ignore */ }
  if (timerData.sound.choice === 'own') { timerData.sound.choice = 'chime'; saveTimer(); }
  if (typeof pomoOwnSoundRemoved === 'function') pomoOwnSoundRemoved();     // pomodoro.js: its two sounds too
}

/* ---------- Playing a choice ---------- */

/* Play one choice at a volume (used by the Test buttons and the alarm). Returns the seconds it rings. */
async function playSound(choice, volume) {
  if (choice === 'off') return 0;
  soundPlays++;
  if (choice === 'own') { const len = await playOwn(volume); if (len) return len; choice = 'chime'; }   // no usable file: the chime instead
  return playBuiltIn(choice, volume);
}

/* ---------- The alarm ----------
   When the Timer runs out the sound REPEATS until someone presses OK (timer.js calls these).
   Each time it plays the whole sound, waits ALARM_GAP milliseconds, and plays it again.
   alarmStop() ends the loop AND cuts any sound still ringing. With the sound Off there is
   nothing to repeat. */
let ALARM_GAP = 1500;          // a pause between repeats, in milliseconds
let alarmOn = false, alarmTimer = null, alarmSound = null;
/* snd is { choice, volume }. The Timer passes nothing and gets its own; the Pomodoro passes its own. */
function alarmStart(snd) {
  if (alarmOn) return;
  alarmOn = true;
  alarmSound = snd || timerData.sound;
  const loop = async () => {
    if (!alarmOn) return;
    const seconds = await playSound(alarmSound.choice, alarmSound.volume);
    if (!alarmOn || alarmSound.choice === 'off') return;
    alarmTimer = setTimeout(loop, (seconds || 2) * 1000 + ALARM_GAP);
  };
  loop();
}
function alarmStop() {
  alarmOn = false;
  clearTimeout(alarmTimer);
  alarmTimer = null;
  silenceAll();
}

/* ---------- The sound box ----------
   A built-in <dialog>, same look as the note box. Two views in one box:
     main:  the choices, Test buttons, volume, Done        (wireframe 6 F)
     own:   add, test or remove your own sound             (wireframe 6 G)
   onClose runs when the box closes, so the page behind can show the new choice. */
function soundBox() {
  let box = document.getElementById('sound-box');
  if (!box) {
    box = make('dialog', 'collect-box note-box');
    box.id = 'sound-box';
    box.setAttribute('aria-label', 'Sound at the end');
    const body = make('div', 'note-body sound-body');
    body.dataset.drawn = 'box';
    body.dataset.fill = 'paper';
    body.dataset.seed = 'sound-box';
    box.append(body);
    document.body.append(box);
    box.body = body;
  }
  return box;
}

function soundButton(label, onClick, main) {
  const b = make('button', main ? 'btn primary' : 'btn', label);
  b.type = 'button';
  b.dataset.drawn = 'box';
  if (main) b.dataset.fill = 'solid';
  b.dataset.seed = 'snd-' + label.toLowerCase().replace(/\W+/g, '-');
  b.addEventListener('click', onClick);
  return b;
}
function linkButton(label, ariaLabel, onClick) {
  const b = make('button', 'link-button', label);
  b.type = 'button';
  if (ariaLabel) b.setAttribute('aria-label', ariaLabel);
  b.addEventListener('click', onClick);
  return b;
}

/* target says WHICH sound the box edits: { snd: {choice, volume}, save: function, title: words }.
   With nothing passed it edits the Timer's sound, as before. */
function timerSoundTarget() { return { snd: timerData.sound, save: saveTimer, title: 'Sound at the end' }; }
function openSoundBox(onClose, target) {
  const box = soundBox();
  box.onclose = onClose || null;
  box.target = target || timerSoundTarget();
  box.setAttribute('aria-label', box.target.title);
  showSoundMain(box);
  if (!box.open) box.showModal();
  drawAll(); watchAll();
}

/* The main view: pick a sound, test it, set the volume. */
function showSoundMain(box) {
  const body = box.body;
  const snd = box.target.snd, save = box.target.save;
  body.replaceChildren(make('h3', '', box.target.title));

  const group = make('div', 'radios');
  group.setAttribute('role', 'radiogroup');
  group.setAttribute('aria-label', box.target.title);
  SOUND_CHOICES.forEach(c => {
    const row = make('div', 'radio-row');
    const label = make('label', 'choice');
    const input = make('input');
    input.type = 'radio';
    input.name = 'end-sound';
    input.checked = snd.choice === c.key;
    const mark = make('span', 'mark');
    const ring = make('span', 'mark-ring'); ring.dataset.drawn = 'ring'; ring.dataset.weight = '2'; ring.dataset.seed = 'mk-' + c.key;
    const dot = make('span', 'mark-dot');   dot.dataset.drawn = 'ring'; dot.dataset.fill = 'solid'; dot.dataset.weight = '2'; dot.dataset.seed = 'md-' + c.key;
    mark.append(ring, dot);
    label.append(input, mark, c.label);
    input.addEventListener('change', () => {
      if (c.key === 'own' && !readOwnSound()) { showSoundOwn(box); return; }   // nothing chosen yet: go and add one
      snd.choice = c.key;
      save();
    });
    row.append(label);
    if (c.key === 'own') {
      const saved = readOwnSound();
      if (saved) row.append(make('span', 'note own-name', saved.name));
      row.append(linkButton(saved ? 'Change' : 'Choose a file', saved ? 'Change my own sound' : 'Choose a file for my own sound', () => showSoundOwn(box)));
    }
    if (c.key !== 'off' && (c.key !== 'own' || readOwnSound())) {
      row.append(linkButton('Test', 'Test ' + c.label, () => playSound(c.key, snd.volume)));
    }
    group.append(row);
  });
  body.append(group);

  /* Volume. Saved as you move it. */
  body.append(make('label', 'field-label', 'Volume'));
  const vol = make('input');
  vol.type = 'range'; vol.min = '0'; vol.max = '100'; vol.value = String(snd.volume);
  vol.setAttribute('aria-label', 'Volume');
  vol.addEventListener('input', () => { snd.volume = Number(vol.value); save(); });
  body.append(vol);
  const keepNote = make('p', 'note', 'Each device keeps its own choice. ');
  const privacy = make('a', '', 'Privacy');
  privacy.href = '#privacy';
  privacy.addEventListener('click', () => box.close());          // close the box, then the link takes you there
  keepNote.append(privacy);
  body.append(keepNote);

  const row = make('div', 'jrow');
  row.append(soundButton('Done', () => box.close(), true));
  body.append(row);
  drawAll(); watchAll();
}

/* The own-sound view. */
function showSoundOwn(box, message) {
  const body = box.body;
  const saved = readOwnSound();
  body.replaceChildren(make('h3', '', 'My own sound'));
  body.append(make('p', '', 'It stays on this device. It is never uploaded, and nobody else can hear or see it.'));

  /* The hidden file picker. */
  const input = make('input');
  input.type = 'file';
  input.id = 'own-sound-input';
  input.accept = '.mp3,.wav,.ogg,.m4a,audio/*';
  input.hidden = true;
  input.addEventListener('change', async () => {
    const file = input.files[0];
    input.value = '';
    if (!file) return;
    const result = await saveOwnSound(file);
    if (result.ok) { box.target.snd.choice = 'own'; box.target.save(); showSoundOwn(box); }
    else showSoundOwn(box, result.why);
  });
  body.append(input);

  if (message) {
    const err = make('p', 'sound-error', message);
    err.setAttribute('role', 'alert');
    body.append(err);
  }
  if (saved && !message) {
    body.append(make('p', 'note', saved.name + ' · the first ' + OWN_SOUND_SECONDS + ' seconds play'));
    const row = make('div', 'jrow');
    row.append(soundButton('Test', () => playSound('own', box.target.snd.volume)),
               linkButton('Remove', 'Remove my own sound', () => { removeOwnSound(); showSoundOwn(box); }),
               linkButton('Choose another file', null, () => input.click()));
    body.append(row);
  } else {
    const row = make('div', 'jrow');
    row.append(soundButton(message ? 'Choose another file' : 'Choose a file', () => input.click()));
    body.append(row);
    if (!message) body.append(make('p', 'note', 'mp3, wav, ogg or m4a · up to 1 MB'));
  }
  body.append(make('p', 'note', 'Clearing your browser data removes it. The built-in sounds stay.'));
  const back = make('div', 'jrow');
  back.append(soundButton('Back', () => showSoundMain(box)));
  body.append(back);
  drawAll(); watchAll();
}
