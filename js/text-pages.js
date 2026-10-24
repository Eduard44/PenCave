/* =====================================================================
   text-pages.js  (the About and Privacy pages, and the Erase box)
   book.js calls buildTextPage('about') or buildTextPage('privacy') when the address bar says
   #about or #privacy. They share ONE template (wireframe 7): a narrow reading column, and a
   margin column with "In short" and "Last updated", like the lesson pages. On a phone "In short"
   moves to the top and "Last updated" to the bottom. They are not book pages: no ribbon, no
   Previous or Next. The words come from text-data.js.

   The Erase box (openEraseBox) is a built-in <dialog>. The SAFE choice, "No, keep my data",
   comes first, is the solid button, and has the focus, so pressing Enter by habit keeps
   everything. Erasing is the second, outline button.

   Needs text-data.js, book.js (make, render), timer.js (timerData, freshTimer, timerAlarmStop),
   progress.js (state, freshProgress).
   ===================================================================== */

/* Everything PenCave keeps in the browser. Erase removes all of these. (If a new key is ever
   added to the site, add it here too.) */
const ERASE_KEYS = ['pencave-progress', 'pencave-seen', 'pencave-visit', 'pencave-timer', 'pencave-own-sound'];

/* Go to Your progress and scroll to the Save file block (where "Download my save" is). */
function goToSaveBlock() {
  setTimeout(() => { const block = document.querySelector('.save-block'); if (block) block.scrollIntoView(); }, 80);
}

/* A "Download my notes →" link that opens Your progress at the Save file block.
   "beforeGo" (optional) runs first, for example to close a box. */
function makeDownloadLink(label, beforeGo) {
  const link = make('a', 'text-link', label + ' ');
  link.href = '#progress';
  const arrow = make('i', 'icon');
  arrow.dataset.icon = 'arrow-right';
  link.append(arrow);
  link.addEventListener('click', () => { if (beforeGo) beforeGo(); goToSaveBlock(); });
  return link;
}

/* ---------- The page ---------- */
function buildTextPage(key) {
  const data = window.PENCAVE_TEXT[key];
  const wrap = make('div', 'text-page');

  /* The margin column: "In short" (top) and "Last updated" (bottom), with a drawn line on its left. */
  const rule = make('span', 'text-rule');
  rule.dataset.drawn = 'rule';
  rule.dataset.seed = 'text-rule-' + key;
  const short = make('aside', 'text-short');
  short.append(make('h3', '', 'In short'), make('p', '', data.short));
  const updated = make('p', 'note text-updated', 'Last updated ' + data.updated);

  /* The reading column. */
  const main = make('div', 'text-main');
  main.append(make('h1', 'page-title', data.title));
  data.sections.forEach((sec, i) => {
    const box = make('section', 'text-section' + (sec.later ? ' is-later' : ''));
    if (sec.later) {                                       // still to decide or write: dashed and grey
      box.dataset.drawn = 'dashed';
      box.dataset.color = 'rule';
      box.dataset.seed = 'later-' + key + i;
    }
    box.append(make('h2', '', sec.heading));
    sec.text.split(/\n\s*\n/).forEach(para => box.append(make('p', '', para)));

    if (sec.action === 'download') {
      const p = make('p', 'text-action');
      p.append(makeDownloadLink('Download my notes'));
      box.append(p);
    }
    if (sec.action === 'erase') {
      const b = make('button', 'btn', 'Erase everything on this device');
      b.type = 'button';
      b.dataset.drawn = 'box';
      b.dataset.seed = 'erase-open';
      b.addEventListener('click', openEraseBox);
      const p = make('p', 'text-action');
      p.append(b, make('span', 'note', ' It asks first.'));
      box.append(p);
    }
    main.append(box);
  });

  wrap.append(rule, short, main, updated);
  return wrap;
}

/* ---------- The Erase box ---------- */
function openEraseBox() {
  let box = document.getElementById('erase-box');
  if (!box) {
    box = make('dialog', 'collect-box note-box');
    box.id = 'erase-box';
    box.setAttribute('aria-label', 'Erase everything on this device');
    const body = make('div', 'note-body erase-body');
    body.dataset.drawn = 'box';
    body.dataset.fill = 'paper';
    body.dataset.seed = 'erase-box';
    box.append(body);
    document.body.append(box);
    box.body = body;
  }
  const body = box.body;
  body.replaceChildren(
    make('h3', '', 'Erase everything on this device?'),
    make('p', '', 'Your progress, notes and settings are kept only in this browser. PenCave holds no copy, so once erased they cannot be brought back.'),
    make('p', '', 'If you want to keep them, download your notes first.')
  );
  const dl = make('p', 'text-action');
  dl.append(makeDownloadLink('Download my notes first', () => box.close()));   // close the box, then go to the Save file block
  body.append(dl);

  /* The safe choice first, solid, and focused. Esc also keeps everything. */
  const keep = make('button', 'btn primary', 'No, keep my data');
  keep.type = 'button';
  keep.dataset.drawn = 'box'; keep.dataset.fill = 'solid'; keep.dataset.seed = 'erase-keep';
  keep.addEventListener('click', () => box.close());
  const erase = make('button', 'btn', 'Yes, delete all my data');
  erase.type = 'button';
  erase.dataset.drawn = 'box'; erase.dataset.seed = 'erase-yes';
  erase.addEventListener('click', eraseEverything);
  const row = make('div', 'jrow');
  row.append(keep, erase);
  body.append(row);

  box.showModal();
  drawAll(); watchAll();
  keep.focus();            // showModal focuses the first control (the link); we want "No" instead
}

/* Erase it all, then start again as a brand-new visitor. */
function eraseEverything() {
  timerAlarmStop();                                          // stop a running alarm and close its pop-up
  ERASE_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } });
  /* Empty the copies the page holds in memory too, so nothing is written back by accident. */
  Object.keys(state).forEach(k => delete state[k]);
  Object.assign(state, freshProgress());
  Object.assign(timerData, freshTimer());
  location.hash = '#l1p1';                                   // the very first screen
  location.reload();                                         // a clean start
}
