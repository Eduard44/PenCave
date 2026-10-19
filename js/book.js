/* =====================================================================
   book.js  (the book shell)
   Reads a lesson's data and builds the current page. Handles Previous,
   Next, the arrow keys and the bookmark ribbon.

   WHERE THE READER IS is kept in the address bar after the #, like
   index.html#l1p2 = lesson 1, page 2. That way the browser's Back button
   works, a page can be bookmarked, and no extra storage is needed.
   (Saving progress between visits comes in a later step.)
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
  const place = readPlace();
  const lesson = window.PENCAVE_LESSONS[place.lesson];
  const content = document.getElementById('page-content');
  content.replaceChildren();                       // clear the old page

  /* The Contents page is built in a later step. For now it is a plain stub,
     so the "Contents" and "skip" links have somewhere to go. */
  if (location.hash === '#contents') {
    showBookParts(false);
    markSeen();
    document.title = 'Contents · PenCave';
    const back = make('a', '', 'Back to Lesson 1');
    back.href = '#l1p1';
    const para = make('p');
    para.append(back);
    content.append(make('h1', 'page-title', 'Contents'),
                   make('p', 'page-intro', 'The contents page is built in a later step.'), para);
    turn.prev = turn.next = null;                  // no page turning here
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
  if (page.intro) content.append(make('p', 'page-intro', page.intro));

  const grid = make('div', 'lesson-grid');
  const frames = make('div', 'frames');
  page.frames.forEach((f, i) => {
    const fig = make('figure', 'frame');
    const art = make('div', 'art');
    art.dataset.drawn = 'box';                      // draw.js puts a pencil box round it
    art.dataset.seed = 'fr' + place.lesson + '-' + n + '-' + i;
    art.innerHTML = stepArt(f.art, (place.lesson * 100 + n * 10 + i) * 13);   // our own SVG, not user text
    fig.append(art, make('figcaption', '', f.caption));
    frames.append(fig);
  });
  const left = make('div');   // the drawings column
  left.append(frames);
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
  content.append(grid);

  /* The big Start button: first screen only. It replaces Next. */
  if (firstScreen) {
    const start = make('a', 'btn primary big start', 'Start');
    start.href = placeLink(place.lesson, 2);
    start.dataset.drawn = 'box';
    start.dataset.fill = 'solid';
    start.dataset.seed = 'start';
    start.dataset.markSeen = '';
    content.append(start);
  }

  /* ---- the footer: Previous, count, Next ---- */
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  document.getElementById('count').firstChild.textContent = 'Page ' + n + ' of ' + total;

  /* Previous: hidden on the first page (the space stays, so Next does not jump). */
  prev.classList.toggle('is-off', n === 1);
  prev.setAttribute('aria-hidden', n === 1 ? 'true' : 'false');
  prev.tabIndex = n === 1 ? -1 : 0;
  prev.href = placeLink(place.lesson, Math.max(n - 1, 1));

  /* Next: on the last page it becomes "Next lesson: [name]". That page and
     the Collect screen do not exist yet, so for now it is shown but inactive. */
  const last = n === total;
  const nextOff = last || firstScreen;               // inactive on the last page, hidden on the first screen
  next.querySelector('span').textContent = last ? 'Next lesson: ' + lesson.next : 'Next';
  next.classList.toggle('is-off', nextOff);
  next.setAttribute('aria-disabled', nextOff ? 'true' : 'false');
  next.setAttribute('aria-hidden', firstScreen ? 'true' : 'false');   // gone from view AND from screen readers
  next.tabIndex = firstScreen ? -1 : 0;
  if (nextOff) next.removeAttribute('href'); else next.href = placeLink(place.lesson, n + 1);

  /* The bookmark ribbon fills from the top as you move through the lesson. */
  const ribbon = document.getElementById('ribbon');
  ribbon.dataset.value = n / total;

  /* Remember where we are, so the arrow keys know where to go. */
  turn.prev = n > 1 ? placeLink(place.lesson, n - 1) : null;
  turn.next = n < total ? placeLink(place.lesson, n + 1) : null;

  /* Draw the pencil borders for the new page. */
  drawAll();
  watchAll();
}
const turn = { prev: null, next: null };   // where the arrow keys lead

/* ---------- Keyboard: left and right arrow keys turn the page ----------
   We ignore them while typing in a text box, or when Ctrl, Alt or Cmd is held
   (those belong to the browser). */
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
  if (e.target.closest('input, textarea, select, [contenteditable]')) return;
  if (e.key === 'ArrowRight' && turn.next) location.hash = turn.next;
  if (e.key === 'ArrowLeft'  && turn.prev) location.hash = turn.prev;
});

/* Whenever the address bar's # changes (a click, an arrow key, the Back button), redraw. */
window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });

/* The first time the page loads. */
render();
