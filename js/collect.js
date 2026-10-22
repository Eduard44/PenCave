/* =====================================================================
   collect.js  (the Collect box)
   Built to match the component sheet (part 8): a still, centred box.
   Normal: the lesson name, a big "+N points", a drawn progress bar to the
   next level, one Collect button.
   Level-up: a little bigger. A big "Level N", what unlocked, the bar for the
   new level, and a note that extra points carry over. No confetti, no animation.
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
  const total = pendingTotal();
  const before = levelInfo(state.points);
  const after = levelInfo(state.points + total);
  const levelUp = after.level > before.level;

  /* Was a lesson finished? Its award is labelled "Lesson 2 finished": read the
     number from the words, then look up the lesson's name. */
  let finished = null;
  state.pending.forEach(a => {
    const m = /^Lesson (\d+) (?:finished|again)$/.exec(a.label);
    if (m && window.PENCAVE_LESSONS[m[1]]) finished = window.PENCAVE_LESSONS[m[1]].title + ' finished';
  });

  /* A short line of what the points were for. Each item is kept on one line
     ("white-space: nowrap" in collect.css), so "+5" never splits from its words. */
  const makeDetail = () => {
    const p = make('p', 'note collect-detail');
    state.pending.forEach((a, i) => {
      if (i) p.append(' · ');
      p.append(make('span', 'nowrap', a.label + ' +' + a.pts));
    });
    return p;
  };

  body.replaceChildren();                                  // clear the last use
  box.classList.toggle('level-up', levelUp);

  if (levelUp) {
    body.append(make('h2', 'collect-level', 'Level ' + after.level));
    body.append(make('p', 'collect-unlock', after.unlock + ' unlocked'));
    body.append(makeDetail());
  } else {
    body.append(make('h3', '', finished || 'Points to collect'));
    body.append(make('p', 'collect-points', '+' + total + ' points'));
    body.append(makeDetail());
  }

  /* The drawn progress bar (draw.js "bar"): one thick pencil stroke, filled to "value". */
  const bar = make('div', 'collect-bar');
  bar.dataset.drawn = 'bar';
  bar.dataset.value = after.frac;
  bar.dataset.seed = 'collect-bar';
  bar.setAttribute('role', 'progressbar');                 // tells a screen reader this is a progress bar
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.setAttribute('aria-valuenow', Math.round(after.frac * 100));
  bar.setAttribute('aria-label', after.next ? 'Progress to Level ' + after.next.n : 'Top level');
  body.append(bar);

  body.append(make('p', 'note', after.next
    ? (levelUp ? 'Extra points count toward Level ' + after.next.n + '. ' + after.toNext + ' more to go.' : after.toNext + ' more points to Level ' + after.next.n)
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
  const actions = make('div', 'collect-actions');
  actions.append(go);
  body.append(actions);

  box.showModal();
  drawAll(); watchAll();                                   // draw the pencil lines now the box is visible
  go.focus();
}
