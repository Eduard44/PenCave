/* =====================================================================
   beats.js  (the page types: "beats" of the lesson rhythm)
   Each lesson page has a "type" in its data (see lessons/lesson-1.js):
     'steps'    step frames (the default, built in book.js)
     'try'      Guided try: a numbered list to follow on paper
     'turn'     Your turn: open exercise cards with Easier/Harder hints and a Done tick
     'reflect'  Reflect: one question, a "Look first" prompt, a plain text box
     'next'     Next: what comes next and why (just words, no extra builder)

   Each builder below receives the page data and returns ONE element.
   book.js puts that element in the left column of the page.
   (C# parallel: a Dictionary of name -> function, like a small factory.)
   make() comes from book.js, which loads after this file but calls us later,
   so it is ready by then.
   ===================================================================== */

const BEATS = {

  /* GUIDED TRY: an ordered list. Data: steps: ['...', '...'] */
  try(page) {
    const list = make('ol', 'try-steps');
    (page.steps || []).forEach(text => list.append(make('li', '', text)));
    return list;
  },

  /* YOUR TURN: one drawn card per exercise.
     Data: exercises: [{ title, text, easier, harder }]
     The Done button only ticks on screen. It is NOT saved (decided for Step 5):
     turn the page and it resets. Saving comes with progress in Step 7. */
  turn(page, lesson, n) {
    const wrap = make('div', 'turn-list');
    (page.exercises || []).forEach((ex, i) => {
      const card = make('section', 'turn-card');
      card.dataset.drawn = 'box';                       // draw.js puts a pencil box round it
      card.dataset.seed = 'ex' + lesson + '-' + n + '-' + i;
      card.append(make('h3', '', ex.title), make('p', '', ex.text));

      /* The two hints. A bold label, then your words. */
      [['Easier: ', ex.easier], ['Harder: ', ex.harder]].forEach(([label, words]) => {
        if (!words) return;
        const hint = make('p', 'note hint');
        hint.append(make('strong', '', label), words);
        card.append(hint);
      });

      /* The tick button. aria-pressed tells screen readers (and draw.js, which
         fills the box solid) whether it is ticked. The words change as well, so
         colour is never the only signal. */
      const done = make('button', 'btn tick-btn');
      done.type = 'button';
      done.dataset.drawn = 'box';
      done.dataset.seed = 'done' + lesson + '-' + n + '-' + i;
      done.setAttribute('aria-pressed', 'false');
      const icon = make('i', 'icon');
      icon.dataset.icon = 'tick';
      const label = make('span', '', 'Mark as done');
      done.append(icon, label);
      done.addEventListener('click', () => {
        const on = done.getAttribute('aria-pressed') !== 'true';
        done.setAttribute('aria-pressed', on ? 'true' : 'false');
        label.textContent = on ? 'Done' : 'Mark as done';
        drawAll();                                      // redraw so the box fills (or empties)
      });
      card.append(done);
      wrap.append(card);
    });
    return wrap;
  },

  /* REFLECT: Data: question, lookFirst: { heading, text }, boxLabel.
     The text box is plain and NOT saved yet (the journal comes in Step 7). */
  reflect(page, lesson, n) {
    const wrap = make('div', 'reflect');
    wrap.append(make('h2', '', page.question));
    if (page.lookFirst) {
      wrap.append(make('h3', '', page.lookFirst.heading), make('p', '', page.lookFirst.text));
    }
    /* A textarea cannot hold a drawn SVG, so the pencil border goes on a wrapper. */
    const box = make('div', 'reflect-box');
    box.dataset.drawn = 'box';
    box.dataset.seed = 'reflect' + lesson + '-' + n;
    const label = make('label', 'note', page.boxLabel || '');
    label.htmlFor = 'reflect-text';
    const area = make('textarea');
    area.id = 'reflect-text';
    area.rows = 5;
    box.append(label, area);
    wrap.append(box);
    return wrap;
  }
};
