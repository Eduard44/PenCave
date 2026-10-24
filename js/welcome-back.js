/* =====================================================================
   welcome-back.js  (the welcome-back strip, wireframe 3)
   After a long time away, a small boxed strip sits at the top of whatever page the reader
   opens first: "Go to Volume 1" (opens Contents so they can repeat basic lessons) or
   "Continue where I was" (just closes it). It never takes anything away and changes no points.

   HOW IT KNOWS: progress.js remembers the last day the reader visited (state.lastDay).
   This file loads BEFORE book.js draws the first page, so state.lastDay is still the OLD day
   here (book.js then updates it to today). We work out the gap once, right now.
   Reloading the same day does not bring the strip back, because the day is then today.

   The strip stays until one of its two buttons is pressed (turning pages does not close it),
   because it lives in index.html outside #page-content.
   The words are in text-data.js (PENCAVE_TEXT.welcomeBack).
   Needs: progress.js (state, todayText), draw.js (drawAll, watchAll), text-data.js.
   ===================================================================== */

/* How many days away counts as "a long time". A number to tune. */
const WELCOME_BACK_DAYS = 30;

/* Whole days between two 'YYYY-MM-DD' texts (local days, so a change of clocks does not matter). */
function daysBetweenTexts(a, b) {
  const part = t => { const [y, m, d] = t.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((part(b) - part(a)) / 86400000);
}

/* Worked out ONCE, at load, before book.js updates the last-visit day. */
const welcomeBackNeeded = (() => {
  try {
    return !!state.lastDay && daysBetweenTexts(state.lastDay, todayText()) >= WELCOME_BACK_DAYS;
  } catch (e) { return false; }
})();

function closeWelcomeBack() {
  const strip = document.getElementById('welcome-strip');
  if (strip) strip.hidden = true;
}

/* Fill and show the strip. Called once, after the page has loaded. */
function showWelcomeBack() {
  const strip = document.getElementById('welcome-strip');
  const words = window.PENCAVE_TEXT && window.PENCAVE_TEXT.welcomeBack;
  if (!strip || !words) return;

  const text = make('div', 'welcome-text');
  text.append(make('p', '', words.line1), make('p', '', words.line2));

  const volume = make('a', 'btn', words.volumeButton);
  volume.href = '#contents';                                  // Contents starts with Volume 1
  volume.dataset.drawn = 'box'; volume.dataset.seed = 'welcome-volume';
  volume.addEventListener('click', closeWelcomeBack);          // the link itself moves to Contents

  const carry = make('button', 'btn', words.continueButton);
  carry.type = 'button';
  carry.dataset.drawn = 'box'; carry.dataset.seed = 'welcome-continue';
  carry.addEventListener('click', closeWelcomeBack);

  const buttons = make('div', 'welcome-buttons');
  buttons.append(volume, carry);

  const box = make('div', 'welcome-box');
  box.dataset.drawn = 'box'; box.dataset.seed = 'welcome-box';
  box.append(text, buttons);
  strip.replaceChildren(box);
  strip.hidden = false;
  drawAll(); watchAll();
}

/* book.js (loaded after this file) defines make(); by the time the page is ready it exists. */
window.addEventListener('DOMContentLoaded', () => { if (welcomeBackNeeded) showWelcomeBack(); });
