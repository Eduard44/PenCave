/* =====================================================================
   unlocks.js  (the "Just unlocked" pop-up, shown right after a level-up)
   When the reader presses Collect and that takes them up a level, collect.js calls
   openUnlocks(levelBefore, levelAfter) AFTER its own box has closed. This second box lists what
   the new level gives, so an unlock feels like something you can go and use:
     - a tool (the Timer, the Pomodoro): "Open the Timer" and "Read about it"
     - a method with no tool yet (Daily warm-up): "Read about it" only
     - a theme (graph paper, drafting vellum): listed in EXTRA_UNLOCKS below, with its own button
   Only things that really exist are listed; nothing is promised. If a level gives nothing that
   exists yet, no box opens. "Later" closes it, and everything stays reachable from Contents.

   It is a built-in <dialog> like the Collect box, so it stacks on top of anything already open
   and leaves it untouched. The Collect box and its level-up version are NOT changed.
   Needs methods-data.js (PENCAVE_METHODS), progress.js (levelInfo), book.js (make).
   ===================================================================== */

/* Things that unlock but are not methods. Set built: true and fill in open when one is made.
   open = { label, href } (the button), for example { label: 'Try graph paper', href: '#progress' }. */
const EXTRA_UNLOCKS = [
  { level: 3, name: 'Graph paper',     line: 'A graph-paper look for your pages.',     built: false, open: null },
  { level: 5, name: 'Drafting vellum', line: 'A drafting-vellum look for your pages.', built: false, open: null }
];

/* Everything that unlocks AT this level and exists now: [{ name, line, open, read }]. */
function unlockItemsAt(level) {
  const items = [];
  window.PENCAVE_METHODS.forEach(m => {
    if (!m.tool || m.tool.level !== level) return;
    items.push({
      name: m.tool.name,
      line: m.line,
      open: m.tool.built ? { label: 'Open the ' + m.tool.name, href: m.tool.href } : null,
      read: { label: 'Read about it', href: '#methods/' + m.slug }
    });
  });
  EXTRA_UNLOCKS.forEach(x => {
    if (x.level === level && x.built) items.push({ name: x.name, line: x.line, open: x.open, read: x.read || null });
  });
  return items;
}

function unlockBox() {
  let box = document.getElementById('unlock-box');
  if (!box) {
    box = make('dialog', 'collect-box level-up');
    box.id = 'unlock-box';
    box.setAttribute('aria-label', 'Just unlocked');
    const body = make('div', 'unlock-body');
    body.dataset.drawn = 'box';
    body.dataset.fill = 'paper';
    body.dataset.seed = 'unlock-box';
    box.append(body);
    document.body.append(box);
    box.body = body;
  }
  return box;
}

/* A button that is really a link (it goes to a page) and closes the box on the way. */
function unlockLink(box, label, href, seed, main) {
  const a = make('a', main ? 'btn primary' : 'btn', label);
  a.href = href;
  a.dataset.drawn = 'box';
  if (main) a.dataset.fill = 'solid';
  a.dataset.seed = seed;
  a.addEventListener('click', () => box.close());
  return a;
}

/* Called by collect.js after a level-up. fromLevel is the level before, toLevel the level now. */
function openUnlocks(fromLevel, toLevel) {
  const items = [];
  for (let lv = fromLevel + 1; lv <= toLevel; lv++) items.push(...unlockItemsAt(lv));
  if (!items.length) return;
  const box = unlockBox(), body = box.body;
  body.replaceChildren(make('h2', 'unlock-title', 'Just unlocked'));
  let first = null;
  items.forEach((it, i) => {
    const sec = make('section', 'unlock-item');
    sec.append(make('h3', '', it.name), make('p', 'note', it.line));
    const row = make('div', 'unlock-actions');
    /* The first thing you can DO is the main (solid) button. If there is no tool, "Read about it" is. */
    if (it.open) { const a = unlockLink(box, it.open.label, it.open.href, 'unlock-open-' + i, i === 0); row.append(a); if (!first) first = a; }
    if (it.read) { const a = unlockLink(box, it.read.label, it.read.href, 'unlock-read-' + i, i === 0 && !it.open); row.append(a); if (!first) first = a; }
    sec.append(row);
    body.append(sec);
  });
  const later = make('button', 'btn', 'Later');
  later.type = 'button';
  later.dataset.drawn = 'box';
  later.dataset.seed = 'unlock-later';
  later.addEventListener('click', () => box.close());
  const end = make('div', 'collect-actions');
  end.append(later);
  body.append(end, make('p', 'note unlock-note', 'You can find all of these again from Contents.'));

  const heading = body.querySelector('h2');
  heading.tabIndex = -1;
  const a = document.activeElement;
  const typing = a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName);
  if (!box.open) box.showModal();
  drawAll(); watchAll();
  (typing || !first ? heading : first).focus();
}
