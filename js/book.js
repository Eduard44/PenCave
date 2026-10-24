/* =====================================================================
   book.js  (the book shell)
   Reads a lesson's data and builds the current page. Handles Previous,
   Next, the arrow keys and the bookmark ribbon.

   WHERE THE READER IS is kept in the address bar after the #, like
   index.html#l1p2 = lesson 1, page 2. That way the browser's Back button
   works, a page can be bookmarked, and no extra storage is needed.
   (The bookmark and progress are saved separately: see progress.js.)
   ===================================================================== */

/* A tiny helper: make an element, give it a class and some text.
   textContent (not innerHTML) so words are never read as code. */
function make(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

/* Read "#l1p2" from the address bar. Anything else means lesson 1, page 1. */
function readPlace() {
  const m = /^#l(\d+)p(\d+)$/.exec(location.hash);
  return m ? { lesson: Number(m[1]), page: Number(m[2]) } : { lesson: 1, page: 1 };
}
const placeLink = (lesson, page) => '#l' + lesson + 'p' + page;

/* ---------- "Has this visitor been here before?" ----------
   A tiny flag in the browser's localStorage (a small notebook the browser
   keeps for this site). It decides whether to show the first screen (big
   Start, tiny skip). Wrapped in try/catch because some browsers refuse
   storage, for example in a private window. Then we simply show the first
   screen every time, which is harmless. */
function hasSeen() { try { return localStorage.getItem('pencave-seen') === '1'; } catch (e) { return false; } }
function markSeen() { try { localStorage.setItem('pencave-seen', '1'); } catch (e) { /* storage refused: ignore */ } }

/* Pressing Start or Skip (anything marked data-mark-seen) counts as "been here". */
document.addEventListener('click', e => { if (e.target.closest('[data-mark-seen]')) markSeen(); });

/* Show or hide the parts that only belong on BOOK pages: the ribbon and the
   Previous/Next footer. Contents (and later About, Privacy, tools) are not book pages. */
function showBookParts(on) {
  document.getElementById('ribbon').hidden = !on;
  document.getElementById('page-foot').hidden = !on;
  document.getElementById('screen').classList.toggle('has-ribbon', on);
}

/* Build and show the page the address bar asks for. */
function render() {
  noteDay();                                       // progress.js: a new day pays 3 points
  updateBar();                                     // the top bar shows the saved level and points
  updateTimerChip();                               // timer.js: the Timer chip appears from Level 2
  const place = readPlace();
  const lesson = window.PENCAVE_LESSONS[place.lesson];
  const content = document.getElementById('page-content');
  content.replaceChildren();                       // clear the old page

  /* The Contents page (the hub). It is not a book page: no ribbon, no footer. */
  if (location.hash === '#contents') {
    showBookParts(false);
    ink.level = inkLevel();                        // progress.js: how tidy the lines are
    markSeen();
    document.title = 'Contents · PenCave';
    content.append(buildContents());               // built in contents.js
    turn.prev = turn.next = null;                  // no page turning here
    drawAll(); watchAll();
    return;
  }
  /* The Your progress page. Like Contents, it is not a book page. */
  const progressRoute = /^#progress(?:\/(\d{4})-(\d{2}))?$/.exec(location.hash);   // #progress or #progress/2026-10 (a month)
  if (progressRoute) {
    showBookParts(false);
    ink.level = inkLevel();
    markSeen();
    document.title = 'Your progress · PenCave';
    content.append(progressRoute[1] ? buildMonth(Number(progressRoute[1]), Number(progressRoute[2])) : buildProgress());   // progress-page.js, calendar.js
    turn.prev = turn.next = null;
    turn.collect = false;
    drawAll(); watchAll();
    return;
  }
  /* The Timer page (#timer). A tool page, not a book page: no ribbon, no footer. */
  if (location.hash === '#timer') {
    showBookParts(false);
    ink.level = inkLevel();
    markSeen();
    document.title = 'Timer · PenCave';
    content.append(buildTimerPage());              // timer-page.js
    turn.prev = turn.next = null;
    turn.collect = false;
    drawAll(); watchAll();
    return;
  }
  /* The About and Privacy pages (#about, #privacy). Text pages, not book pages. */
  const textRoute = /^#(about|privacy)$/.exec(location.hash);
  if (textRoute) {
    showBookParts(false);
    ink.level = inkLevel();
    markSeen();
    document.title = window.PENCAVE_TEXT[textRoute[1]].title + ' · PenCave';
    content.append(buildTextPage(textRoute[1]));   // text-pages.js (the words are in text-data.js)
    turn.prev = turn.next = null;
    turn.collect = false;
    drawAll(); watchAll();
    return;
  }
  showBookParts(true);

  if (!lesson) {                                    // no such lesson: say so plainly
    content.append(make('h1', '', 'This page does not exist yet.'));
    return;
  }
  /* Keep the page number inside the lesson (1 up to the last page). */
  const total = lesson.pages.length;
  const n = Math.min(Math.max(place.page, 1), total);
  const page = lesson.pages[n - 1];
  /* TIDINESS: sketchy at the start, cleaner with effort, fully clean once every
     lesson is finished (see inkLevel in progress.js). Never announced. */
  ink.level = inkLevel();
  noteVisit(place.lesson, n, total);                 // progress.js: bookmark, and finishing the last page
  /* Is this the very first screen? Lesson 1, page 1, and a visitor who has not been here before. */
  const firstScreen = place.lesson === 1 && n === 1 && !hasSeen();
  if (!(place.lesson === 1 && n === 1)) markSeen();   // turning past page 1 counts as "been here"

  document.title = page.title + ' · PenCave';

  /* ---- the page itself ----
     The small line above the heading says where we are: "Lesson 1 · Welcome and how
     to practise". On the first screen it says the volume instead (see the wireframe). */
  if (firstScreen) {
    /* The tiny skip link, top right. It goes to Contents. */
    const skip = make('p', 'skip');
    const link = make('a', '', 'Already drawing? Skip the basics');
    link.href = '#contents';
    link.dataset.markSeen = '';
    const arrow = make('i', 'icon');
    arrow.dataset.icon = 'arrow-right';
    skip.append(link, arrow);
    content.append(skip);
  }
  content.append(make('p', 'eyebrow', firstScreen ? lesson.volume : 'Lesson ' + lesson.number + ' · ' + lesson.title));
  content.append(make('h1', 'page-title', page.title));
  if (page.intro && !firstScreen) content.append(make('p', 'page-intro', page.intro));   // on the first screen the intro sits in the left column, below

  const grid = make('div', 'lesson-grid');
  grid.classList.toggle('no-margin', !(page.notes && page.notes.length));   // no notes: the page uses the full width
  const frames = make('div', 'frames');
  (page.frames || []).forEach((f, i) => {      // a page may have no frames (Guided try, Your turn...)
    const fig = make('figure', 'frame');
    const art = make('div', 'art');
    art.dataset.drawn = 'box';                      // draw.js puts a pencil box round it
    art.dataset.seed = 'fr' + place.lesson + '-' + n + '-' + i;
    art.innerHTML = stepArt(f.art, (place.lesson * 100 + n * 10 + i) * 13);   // our own SVG, not user text
    fig.append(art, make('figcaption', '', f.caption));
    frames.append(fig);
  });
  const left = make('div');   // the drawings column
  if (frames.children.length) left.append(frames);
  /* Other page types (see beats.js): the page's "type" picks a builder.
     No type means a plain steps page (frames only). */
  const builder = BEATS[page.type];
  if (builder) left.append(builder(page, place.lesson, n));
  grid.append(left);

  /* The margin column: notes beside the drawing (under it on a phone). */
  if (page.notes && page.notes.length) {
    const aside = make('aside', 'margin-col');
    const rule = make('span', 'vrule');
    rule.dataset.drawn = 'rule';
    rule.dataset.seed = 'mv' + n;
    aside.append(rule);
    page.notes.forEach(note => aside.append(make('h3', '', note.heading), make('p', '', note.text)));
    if (page.marginArt) {
      const small = make('div', 'margin-art');
      small.innerHTML = stepArt(page.marginArt, (place.lesson * 100 + n * 10 + 7) * 13);
      aside.append(small);
    }
    grid.append(aside);
  }
  if (page.rest) grid.append(make('p', 'note rest-note', page.rest));
  if (!firstScreen) content.append(grid);

  /* THE FIRST SCREEN (wireframe 3): words and the big Start button on the left, ONE
     main drawing on the right (the page's last frame). On a phone the drawing comes
     first, then the words, then Start. Start replaces Next. */
  if (firstScreen) {
    const fg = make('div', 'first-grid');
    const words = make('div', 'first-left');
    if (page.intro) words.append(make('p', 'page-intro', page.intro));
    const start = make('a', 'btn primary big start', 'Start');
    start.href = placeLink(place.lesson, 2);
    start.dataset.drawn = 'box';
    start.dataset.fill = 'solid';
    start.dataset.seed = 'start';
    start.dataset.markSeen = '';
    words.append(start);
    fg.append(words);
    const main = (page.frames || []).slice(-1)[0];
    if (main) {
      const fig = make('figure', 'frame first-right');
      const art = make('div', 'art');
      art.dataset.drawn = 'box';
      art.dataset.seed = 'first-art';
      art.innerHTML = stepArt(main.art, place.lesson * 1300);   // our own SVG, not user text
      fig.append(art);
      fg.append(fig);
    }
    content.append(fg);
  }

  /* ---- the footer: Previous, count, Next ---- */
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  document.getElementById('count').firstChild.textContent = 'Page ' + n + ' of ' + total;

  /* Where do Previous and Next lead? Within a lesson, one page back or on. At the
     edges they cross into the neighbouring lesson:
       Previous on page 1  ->  the LAST page of the lesson before
       Next on the last page -> page 1 of the lesson after
     (When the Collect screen is built in Step 7 it will sit in that last step.) */
  const last = n === total;
  const lessonBefore = window.PENCAVE_LESSONS[place.lesson - 1];
  const lessonAfter = window.PENCAVE_LESSONS[place.lesson + 1];
  let prevHref = null, nextHref = null;                  // null = no link (button hidden or off)
  if (n > 1) prevHref = placeLink(place.lesson, n - 1);
  else if (lessonBefore) prevHref = placeLink(place.lesson - 1, lessonBefore.pages.length);
  if (!last) nextHref = placeLink(place.lesson, n + 1);
  else if (lessonAfter) nextHref = placeLink(place.lesson + 1, 1);
  else nextHref = '#contents';                           // the last lesson: back to the Contents

  /* Previous: hidden when there is nowhere to go (the space stays, so Next does not jump). */
  prev.classList.toggle('is-off', !prevHref);
  prev.setAttribute('aria-hidden', prevHref ? 'false' : 'true');
  prev.tabIndex = prevHref ? 0 : -1;
  if (prevHref) prev.href = prevHref; else prev.removeAttribute('href');

  /* Next: on the last page it says "Next lesson: [name]". On a phone the name is
     wrapped in .hide-phone, so the label stays on one line. After the very last
     lesson it says "Contents". On the first screen the Start button replaces it. */
  const nextLabel = next.querySelector('span');
  nextLabel.textContent = last ? (lessonAfter ? 'Next lesson' : 'Contents') : 'Next';
  if (last && lessonAfter) nextLabel.append(make('span', 'hide-phone', ': ' + lesson.next));
  /* On the first screen the big Start button takes Next's place, so Next is hidden.
     The arrow keys still turn the page. */
  next.classList.toggle('is-off', firstScreen);
  next.removeAttribute('aria-disabled');
  next.setAttribute('aria-hidden', firstScreen ? 'true' : 'false');   // gone from view AND from screen readers
  next.tabIndex = firstScreen ? -1 : 0;
  if (firstScreen) next.removeAttribute('href'); else next.href = nextHref;

  /* On a "Next" page (the end of a lesson) the same link, in the same spot, turns
     into a big solid button: it is a bigger moment than turning an ordinary page.
     (Later, the Collect / level-up box will open from this button.) */
  const bigNext = page.type === 'next';
  next.classList.toggle('pf-big', bigNext);
  document.getElementById('page-foot').classList.toggle('big-next', bigNext);   // lets the phone layout give the button its own row
  if (bigNext) {
    next.dataset.drawn = 'box'; next.dataset.fill = 'solid'; next.dataset.seed = 'next-go';
  } else {
    delete next.dataset.drawn; delete next.dataset.fill; delete next.dataset.seed;
    const old = next.querySelector(':scope > svg.ink');           // remove the pencil box drawn earlier
    if (old) old.remove();
  }

  /* The bookmark ribbon fills from the top as you move through the lesson. */
  const ribbon = document.getElementById('ribbon');
  ribbon.dataset.value = n / total;

  /* Remember where we are, so the arrow keys know where to go. */
  turn.prev = prevHref;
  turn.next = nextHref;
  turn.collect = last && !firstScreen;           // on a lesson's last page, Next opens the Collect box first

  /* Draw the pencil borders for the new page. */
  drawAll();
  watchAll();
}
const turn = { prev: null, next: null, collect: false };   // where the arrow keys lead

/* Going "Next". On a lesson's last page, any waiting points are shown in the
   Collect box first; Collect then carries on to the next lesson. */
function goNext() {
  if (!turn.next) return;
  const target = turn.next;
  if (turn.collect && state.pending.length) openCollect(() => { location.hash = target; });
  else location.hash = target;
}
/* The Next link in the footer: same rule as the arrow key. */
document.getElementById('next').addEventListener('click', e => {
  if (turn.collect && state.pending.length) { e.preventDefault(); goNext(); }
});

/* ---------- Keyboard: left and right arrow keys turn the page ----------
   We ignore them while typing in a text box, or when Ctrl, Alt or Cmd is held
   (those belong to the browser). */
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
  if (e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (document.querySelector('dialog[open]')) return;     // a box is open: the arrows do nothing behind it
  if (e.key === 'ArrowRight' && turn.next) goNext();
  if (e.key === 'ArrowLeft'  && turn.prev) location.hash = turn.prev;
});

/* Whenever the address bar's # changes (a click, an arrow key, the Back button), redraw. */
window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });

/* The first time the page loads. */
render();
