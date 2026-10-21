/* =====================================================================
   collect.js  (the Collect box)
   A still box: what was earned, a thin bar to the next level, one Collect
   button. When a level is reached, the box is a little bigger and says
   what unlocked. No confetti, no animation.
   Uses the browser's built-in <dialog> (see index.html): it handles the
   dimmed background, the Escape key and keyboard focus for us.
   Needs progress.js (points, levels) and book.js (make).
   ===================================================================== */

/* Open the box. "then" is a function to run after the reader presses Collect
   (for example: go on to the next lesson). Does nothing if nothing is pending. */
function openCollect(then) {
  if (!state.pending.length) { if (then) then(); return; }
  const box = document.getElementById('collect');
  const body = document.getElementById('collect-body');
  const before = levelInfo(state.points);
  const after = levelInfo(state.points + pendingTotal());
  const levelUp = after.level > before.level;

  body.replaceChildren();                                  // clear the last use
  box.classList.toggle('level-up', levelUp);

  body.append(make('h2', '', levelUp ? 'Level ' + after.level : 'Points to collect'));

  /* One row per award: the words, and the points on the right. */
  const list = make('ul', 'collect-list');
  state.pending.forEach(a => {
    const row = make('li');
    row.append(make('span', '', a.label), make('span', '', '+' + a.pts));
    list.append(row);
  });
  body.append(list);

  /* A level-up names what it unlocked. */
  if (levelUp) body.append(make('p', 'collect-unlock', 'Now open: ' + after.unlock));

  /* The thin bar to the next level, and the words under it. */
  const bar = make('div', 'collect-bar');
  bar.dataset.drawn = 'box';
  bar.dataset.seed = 'collect-bar';
  const fill = make('span', 'collect-fill');
  fill.style.width = Math.round(after.frac * 100) + '%';
  bar.append(fill);
  body.append(bar);
  body.append(make('p', 'note', after.next
    ? (after.toNext + ' more points to Level ' + after.next.n)
    : 'The top level for now.'));

  const go = make('button', 'btn primary', 'Collect');
  go.type = 'button';
  go.dataset.drawn = 'box';
  go.dataset.fill = 'solid';
  go.dataset.seed = 'collect-go';
  go.addEventListener('click', () => {
    collectPoints();
    box.close();
    if (then) then();
  });
  body.append(go);

  box.showModal();
  drawAll(); watchAll();                                   // draw the pencil lines now the box is visible
  go.focus();
}
