/* =====================================================================
   methods.js  (the Learning methods pages: #methods and #methods/<slug>)
   book.js calls buildMethodsList() for #methods and buildMethodPage(slug) for a single method.
   They are reading pages, not book pages: no ribbon, no Previous or Next. They are free to read
   at every level; a method's TOOL (the Timer, the Pomodoro) is what unlocks.
   The words and sources come from methods-data.js.

   The list (wireframe 6 D): "Dark means ready to use. Grey means it unlocks later, and is
   still yours to read." A dark (solid) tile is ready; a grey dashed tile unlocks later.
   A method page uses the same layout as About and Privacy (text-pages.css): the words on the
   left, "In short" and "Last updated" in the margin.

   Needs methods-data.js, book.js (make), timer.js (timerUnlocked), pomodoro.js (pomoUnlocked).
   ===================================================================== */

const methodBySlug = slug => window.PENCAVE_METHODS.find(m => m.slug === slug) || null;

/* Is this method's tool ready to use right now? A method with no tool (Spaced practice) is always ready. */
const methodReady = m => !m.tool || (m.tool.built && m.tool.ready());

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
  wrap.append(make('p', 'note', 'Dark means ready to use. Grey means it unlocks later, and is still yours to read.'));

  const tiles = make('div', 'method-tiles');
  window.PENCAVE_METHODS.forEach((m, i) => {
    const ready = methodReady(m);
    const tile = make('div', 'method-tile' + (ready ? ' is-open' : ''));
    tile.dataset.drawn = ready ? 'box' : 'dashed';
    if (!ready) tile.dataset.color = 'locked';
    tile.dataset.seed = 'method' + i;
    const row = make('p', 'method-links');
    row.append(methodLink('Read more →', '#methods/' + m.slug));
    if (m.tool) {
      if (ready) row.append(methodLink('Open ' + m.tool.name + ' →', m.tool.href));
      else row.append(make('span', 'note', 'Level ' + m.tool.level + ' · ' + m.tool.points + ' points'));
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

/* ---------- One method ---------- */
function buildMethodPage(slug) {
  const m = methodBySlug(slug);
  if (!m) return buildMethodsList();
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

  /* The PenCave tool that goes with the method, and where it stands. */
  if (m.tool && m.tool.built) {
    const box = make('section', 'text-section');
    box.append(make('h2', '', 'In PenCave'));
    if (m.tool.ready()) {
      box.append(make('p', '', 'The ' + m.tool.name + ' is ready to use.'));
      const p = make('p', 'text-action');
      p.append(methodLink('Open the ' + m.tool.name + ' →', m.tool.href));
      box.append(p);
    } else {
      box.append(make('p', '', 'The ' + m.tool.name + ' unlocks at Level ' + m.tool.level + ' (' + m.tool.points + ' points). This page is free to read, and nothing in the lessons is locked.'));
    }
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
