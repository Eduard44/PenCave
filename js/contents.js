/* =====================================================================
   contents.js  (the Contents page: the hub and the only menu)
   book.js calls buildContents() when the address bar says #contents.
   Layout (wireframe 2): on the left, Volume 1 as a path of dots joined by
   one line, then Volumes 2 and 3 as "coming soon"; on the right, the tools.
   Lessons are read from the lesson data, so a new lesson appears by itself.
   Dots (from progress.js): filled = finished, ringed = you are here, empty = not started.
   make() and placeLink() come from book.js; PENCAVE_LESSONS from the lesson files.
   ===================================================================== */

/* The tools and the level each one needs (draft numbers, tuned in Step 7).
   Not links yet: the tool pages do not exist. */
const TOOLS = [
  { name: 'Timer',              level: 'Level 2 · 30 points' },
  { name: 'Pomodoro',           level: 'Level 3 · 80 points' },
  { name: 'Daily warm-up',      level: 'Level 4 · 150 points' },
  { name: 'Printable sheets',   level: 'Level 5 · 250 points' },
  { name: 'Challenge counters', level: 'Level 6 · points to tune' }
];

/* The two later volumes: a name and a one-line list of what they hold. */
const LATER_VOLUMES = [
  { name: 'Volume 2 · Building up', about: 'Proportions · One-point perspective · Dynamics' },
  { name: 'Volume 3 · Branches',    about: 'Perspective · Faces · Shading · Rendering · Composition · Anatomy' }
];

/* One dot for the path. "done" fills it; "here" adds a second ring round it. */
function makeDot(done, here) {
  const wrap = make('span', 'dot-wrap');
  if (here) {
    const outer = make('span', 'dot-outer');
    outer.dataset.drawn = 'ring';
    outer.dataset.seed = 'dot-out' + (done ? 'd' : 'n');
    wrap.append(outer);
  }
  const inner = make('span', 'dot-inner');
  inner.dataset.drawn = 'ring';
  inner.dataset.fill = done ? 'solid' : 'paper';
  inner.dataset.weight = '2';
  inner.dataset.seed = 'dot-in' + (done ? 'd' : 'n');
  wrap.append(inner);
  return wrap;
}

function buildContents() {
  const visit = state;                              // the saved progress (progress.js)
  const wrap = make('div', 'contents');

  /* ---- Title row, and (only if the reader has been somewhere) the Continue strip ---- */
  const head = make('div', 'contents-head');
  head.append(make('h1', 'page-title', 'Contents'));
  const last = visit.last;
  const lastLesson = last && window.PENCAVE_LESSONS[last.lesson];
  if (lastLesson && !(last.lesson === 1 && last.page === 1)) {
    const cont = make('a', 'continue-strip');
    cont.href = placeLink(last.lesson, last.page);
    cont.dataset.drawn = 'dashed';
    cont.dataset.seed = 'continue';
    cont.append('Continue: Lesson ' + last.lesson + ' · ' + lastLesson.title + ', page ' + last.page + ' ');
    const arrow = make('i', 'icon');
    arrow.dataset.icon = 'arrow-right';
    cont.append(arrow);
    head.append(cont);
  }
  /* Points that were earned but not yet collected wait here, in case the reader
     left a lesson without pressing Next. Pressing opens the Collect box. */
  if (state.pending.length) {
    const wait = make('button', 'btn continue-strip', 'Collect ' + pendingTotal() + ' points');
    wait.type = 'button';
    wait.dataset.drawn = 'dashed';
    wait.dataset.seed = 'collect-wait';
    wait.style.marginLeft = '12px';
    wait.addEventListener('click', () => openCollect(render));   // render() redraws Contents without the strip
    head.append(wait);
  }
  wrap.append(head);

  /* ---- Left column: Volume 1 as a path of dots ---- */
  const left = make('div', 'toc-col');
  left.append(make('h2', '', 'Volume 1 · Foundations'));
  const under = make('span', 'h-rule');                // the pencil line under the heading
  under.dataset.drawn = 'rule'; under.dataset.seed = 'v1-rule';
  left.append(under, make('p', 'page-intro', 'Each lesson builds on the one before. Take them in order if you can.'));

  const list = make('ol', 'toc');
  const line = make('span', 'toc-line');               // the one line joining the dots
  line.dataset.drawn = 'rule'; line.dataset.seed = 'toc-line'; line.dataset.weight = '2';
  list.append(line);
  Object.keys(window.PENCAVE_LESSONS).map(Number).sort((a, b) => a - b).forEach(num => {
    const lesson = window.PENCAVE_LESSONS[num];
    const done = visit.done.includes(num);
    const here = !!last && last.lesson === num;
    const row = make('li', 'toc-row');
    row.append(makeDot(done, here));
    const link = make('a', 'toc-link');
    link.href = placeLink(num, 1);
    link.append(make('span', 'toc-n', String(num)), make('span', 'toc-title', lesson.title));
    /* Words for screen readers: the dots alone say nothing to them. */
    link.append(make('span', 'sr-only', done ? ' (finished)' : here ? ' (you are here)' : ' (not started)'));
    row.append(link, make('span', 'note', 'leads to: ' + lesson.next));
    if (here) row.append(make('span', 'note here-note', 'you are here'));
    list.append(row);
  });
  left.append(list);

  /* Volumes 2 and 3: dashed, grey, "coming soon" */
  LATER_VOLUMES.forEach((v, i) => {
    const box = make('div', 'toc-later');
    box.dataset.drawn = 'dashed';
    box.dataset.color = 'locked';
    box.dataset.seed = 'vol' + i;
    box.append(make('h2', '', v.name), make('p', 'note', 'coming soon'), make('p', 'note', v.about));
    left.append(box);
  });
  wrap.append(left);

  /* ---- Right column: the tools, with a drawn line on its left (like the lesson margin) ---- */
  const right = make('aside', 'tools-col');
  const vr = make('span', 'vrule');
  vr.dataset.drawn = 'rule'; vr.dataset.seed = 'tools-vrule';
  right.append(vr, make('h2', '', 'Tools'));
  const tiles = make('div', 'tool-tiles');
  /* The tools that have a page so far. */
  const TOOL_PAGES = {
    Timer:    { href: '#timer',    unlocked: timerUnlocked, openWords: 'Open the Timer' },
    Pomodoro: { href: '#pomodoro', unlocked: pomoUnlocked,  openWords: 'Open the Pomodoro' }
  };
  TOOLS.forEach((t, i) => {
    /* The Timer and the Pomodoro exist so far: their tiles are links. Before their level a tile stays
       dashed and grey and opens the locked page; once unlocked it is a solid box with dark words.
       The other three tiles are exactly as they were. */
    const page = TOOL_PAGES[t.name];
    const open = !!page && page.unlocked();                      // timer.js, pomodoro.js
    const tile = make(page ? 'a' : 'div', 'tool-tile' + (open ? ' is-open' : ''));
    if (page) tile.href = page.href;
    tile.dataset.drawn = open ? 'box' : 'dashed';
    if (!open) tile.dataset.color = 'locked';
    tile.dataset.seed = 'tool' + i;
    tile.append(make('h3', '', t.name), make('p', 'note', open ? page.openWords : t.level));
    tiles.append(tile);
  });
  /* The Learning methods tile: bigger than the tools, always open (a link to #methods). About and Privacy are
     not here: they are in the small footer on every page. */
  const methods = make('a', 'methods-tile');
  methods.href = '#methods';
  methods.dataset.drawn = 'box';
  methods.dataset.seed = 'methods-tile';
  methods.append(make('h3', '', 'Learning methods'), make('p', 'note', 'How each method works, and why it helps'));
  right.append(tiles, methods, make('p', 'note tools-note', 'Nothing here ever blocks a lesson.'));
  wrap.append(right);
  return wrap;
}
