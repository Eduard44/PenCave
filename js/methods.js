/* =====================================================================
   methods.js  (the Learning methods pages: #methods and #methods/<slug>)
   book.js calls buildMethodsList() for #methods and buildMethodPage(slug) for a single method.
   They are reading pages, not book pages: no ribbon, no Previous or Next. A method's page opens when
   its level is reached (Spaced practice has no tool, so it is always open); before that the page is
   a short teaser. The pop-up after the level-up (unlocks.js) leads to it.
   The words and sources come from methods-data.js.

   The list (wireframe 6 D): a dark (solid) tile is unlocked; a grey dashed tile unlocks later.
   A method page uses the same layout as About and Privacy (text-pages.css): the words on the
   left, "In short" and "Last updated" in the margin.

   Needs methods-data.js, book.js (make), timer.js (timerUnlocked), pomodoro.js (pomoUnlocked).
   ===================================================================== */

const methodBySlug = slug => window.PENCAVE_METHODS.find(m => m.slug === slug) || null;

/* Is the method UNLOCKED? A method with no tool (Spaced practice) is always open. Otherwise it opens at
   its tool's level, even if the tool itself is not made yet (Daily warm-up). */
const methodUnlocked = m => !m.tool || levelInfo(state.points).level >= m.tool.level;
/* Can its tool be used right now? */
const methodToolReady = m => !!m.tool && m.tool.built && methodUnlocked(m);

/* A link made of text. */
function methodLink(text, href, external) {
  const a = make('a', 'text-link', text);
  a.href = href;
  if (external) { a.target = '_blank'; a.rel = 'noopener'; }
  return a;
}

/* ---------- The list page ---------- */
function buildMethodsList() {
  const wrap = make('div', 'methods-page');
  wrap.append(make('h1', 'page-title', 'Learning methods'));
  wrap.append(make('p', 'note', 'Dark means unlocked. Grey means it unlocks at a later level.'));

  const tiles = make('div', 'method-tiles');
  window.PENCAVE_METHODS.forEach((m, i) => {
    const open = methodUnlocked(m);
    const tile = make('div', 'method-tile' + (open ? ' is-open' : ''));
    tile.dataset.drawn = open ? 'box' : 'dashed';
    if (!open) tile.dataset.color = 'locked';
    tile.dataset.seed = 'method' + i;
    const row = make('p', 'method-links');
    if (open) {
      row.append(methodLink('Read more →', '#methods/' + m.slug));
      if (methodToolReady(m)) row.append(methodLink('Open ' + m.tool.name + ' →', m.tool.href));
    } else {
      row.append(make('span', 'note', 'Level ' + m.tool.level + ' · ' + m.tool.points + ' points'));   // locked: no link, the words say when
    }
    tile.append(make('h2', '', m.title), make('p', '', m.line), row);
    tiles.append(tile);
  });
  /* "More methods to come": a dashed grey line, not a link. */
  const more = make('div', 'method-more');
  more.dataset.drawn = 'dashed';
  more.dataset.color = 'locked';
  more.dataset.seed = 'method-more';
  more.append(make('p', 'note', 'More methods to come'));
  tiles.append(more);
  wrap.append(tiles);
  return wrap;
}

/* ---------- A method that is not unlocked yet: a short teaser ----------
   The full explanation opens when the level is reached (the pop-up after the level-up leads to it). */
function buildMethodTeaser(m) {
  const wrap = make('div', 'methods-page');
  const back = make('a', 'back-link', '← Learning methods');
  back.href = '#methods';
  wrap.append(back, make('h1', 'page-title', m.title), make('p', '', m.line));
  const need = m.tool.points;
  const box = make('div', 'locked-tile');
  box.dataset.drawn = 'dashed';
  box.dataset.color = 'rule';
  box.dataset.seed = 'teaser-' + m.slug;
  box.append(make('p', 'locked-title', 'Unlocks at Level ' + m.tool.level + ' · ' + need + ' points'));
  const row = make('div', 'locked-row');
  const bar = make('div', 'locked-bar');
  bar.dataset.drawn = 'bar';
  bar.dataset.value = Math.min(1, state.points / need);
  bar.dataset.seed = 'teaser-bar-' + m.slug;
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', String(need));
  bar.setAttribute('aria-valuenow', String(Math.min(state.points, need)));
  bar.setAttribute('aria-label', 'Points towards Level ' + m.tool.level);
  row.append(bar, make('span', 'note', state.points + ' of ' + need));
  box.append(row);
  wrap.append(box, make('p', 'note', 'Nothing in the lessons is locked.'));
  return wrap;
}

/* ---------- One method ---------- */
function buildMethodPage(slug) {
  const m = methodBySlug(slug);
  if (!m) return buildMethodsList();
  if (!methodUnlocked(m)) return buildMethodTeaser(m);
  const wrap = make('div', 'text-page');                     // the same grid as About and Privacy

  const rule = make('span', 'text-rule');
  rule.dataset.drawn = 'rule';
  rule.dataset.seed = 'method-rule-' + m.slug;
  const short = make('aside', 'text-short');
  short.append(make('h3', '', 'In short'), make('p', '', m.short));
  const updated = make('p', 'note text-updated', 'Last updated ' + m.updated);

  const main = make('div', 'text-main');
  const back = make('a', 'back-link', '← Learning methods');
  back.href = '#methods';
  main.append(back, make('h1', 'page-title', m.title));

  m.sections.forEach(sec => {
    const box = make('section', 'text-section');
    box.append(make('h2', '', sec.heading));
    sec.text.split(/\n\s*\n/).forEach(para => box.append(make('p', '', para)));
    main.append(box);
  });

  /* The PenCave tool that goes with the method (the page is only shown once it is unlocked). */
  if (methodToolReady(m)) {
    const box = make('section', 'text-section');
    box.append(make('h2', '', 'In PenCave'));
    box.append(make('p', '', 'The ' + m.tool.name + ' is ready to use.'));
    const p = make('p', 'text-action');
    p.append(methodLink('Open the ' + m.tool.name + ' →', m.tool.href));
    box.append(p);
    main.append(box);
  }

  /* Where the words came from. */
  const src = make('section', 'text-section');
  src.append(make('h2', '', 'Sources'));
  const list = make('ul', 'method-sources');
  m.sources.forEach(s => {
    const li = make('li');
    li.append(methodLink(s.title, s.url, true));
    list.append(li);
  });
  src.append(list);
  main.append(src);

  wrap.append(rule, short, main, updated);
  return wrap;
}
