/* =====================================================================
   contents.js  (the Contents page: the hub and the only menu)
   book.js calls buildContents() when the address bar says #contents.
   It lists Volume 1 from the lesson data (so a new lesson appears here
   by itself), then Volumes 2 and 3 as "coming soon", then the tools.
   make() comes from book.js and PENCAVE_LESSONS from the lesson files.

   NOT HERE YET (they need saved progress, Step 7): the "Continue where I
   was" line, and the finished / you-are-here dots beside each lesson.
   ===================================================================== */

/* The tools and the level each one needs (draft numbers from Step 2, tuned in Step 7).
   They are not links yet: the tool pages do not exist. */
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

function buildContents() {
  const wrap = make('div', 'contents');
  wrap.append(make('h1', 'page-title', 'Contents'));

  /* ---- Volume 1: one row per lesson, found in the lesson data ---- */
  wrap.append(make('h2', 'toc-volume', 'Volume 1 · Foundations'));
  wrap.append(make('p', 'page-intro', 'Each lesson builds on the one before. Take them in order if you can.'));

  const list = make('ol', 'toc');
  Object.keys(window.PENCAVE_LESSONS).map(Number).sort((a, b) => a - b).forEach(num => {
    const lesson = window.PENCAVE_LESSONS[num];
    const row = make('li', 'toc-row');
    const link = make('a', 'toc-link');
    link.href = placeLink(num, 1);
    link.append(make('span', 'toc-n', String(num)), make('span', 'toc-title', lesson.title));
    row.append(link, make('span', 'note', 'leads to: ' + lesson.next));
    const rule = make('span', 'toc-rule');           // the pencil line under the row
    rule.dataset.drawn = 'rule';
    rule.dataset.seed = 'toc' + num;
    row.append(rule);
    list.append(row);
  });
  wrap.append(list);

  /* ---- Volumes 2 and 3: dashed, grey, "coming soon" ---- */
  LATER_VOLUMES.forEach((v, i) => {
    const box = make('div', 'toc-later');
    box.dataset.drawn = 'dashed';
    box.dataset.color = 'locked';
    box.dataset.seed = 'vol' + i;
    box.append(make('h2', '', v.name), make('p', 'note', 'coming soon'), make('p', 'note', v.about));
    wrap.append(box);
  });

  /* ---- Tools: dashed tiles with the level written in words ---- */
  wrap.append(make('h2', 'toc-volume', 'Tools'));
  const tiles = make('div', 'tool-tiles');
  TOOLS.forEach((t, i) => {
    const tile = make('div', 'tool-tile');
    tile.dataset.drawn = 'dashed';
    tile.dataset.color = 'locked';
    tile.dataset.seed = 'tool' + i;
    tile.append(make('h3', '', t.name), make('p', 'note', t.level));
    tiles.append(tile);
  });
  wrap.append(tiles, make('p', 'note tools-note', 'Nothing here ever blocks a lesson.'));

  /* ---- Small items at the foot. Plain grey words for now: those pages come later. ---- */
  wrap.append(make('p', 'note foot-items', 'Learning methods · About · Privacy (these pages come later)'));
  return wrap;
}
