/* =====================================================================
   beats.js  (the page types: "beats" of the lesson rhythm)
   Each lesson page has a "type" in its data (see lessons/lesson-1.js):
     'steps'     step frames (the default, built in book.js)
     'try'       Guided try: a numbered list to follow on paper
     'turn'      Your turn: open exercise cards, side by side, each with a tick
     'practice'  Practice: counted pages to tick off as you fill them
     'reflect'   Reflect: one question, a "Look first" prompt, a plain text box
     'next'      Next: what comes next and why, a big button, a small dot path

   Each builder below receives the page data and returns ONE element.
   book.js puts that element in the left column of the page.
   (C# parallel: a Dictionary of name -> function, like a small factory.)
   make(), drawAll() and stepArt() come from other scripts that load first or
   are ready by the time these run.

   TICKS ARE NOT SAVED YET (decided for Step 5): they only show on screen and
   reset when you turn the page. Saving comes with progress in Step 7.
   ===================================================================== */

/* A small tick button, used by Your turn and Practice.
   - label: what a screen reader says ("Mark exercise A as done")
   - seed: any text; the same seed always gives the same pencil wobble
   When pressed, aria-pressed is "true": draw.js fills the box solid and the tick shows. */
function makeTick(label, seed, className, onChange) {
  const btn = make('button', 'tick ' + className);
  btn.type = 'button';
  btn.setAttribute('aria-pressed', 'false');
  btn.setAttribute('aria-label', label);
  btn.dataset.drawn = 'box';
  btn.dataset.seed = seed;
  const icon = make('i', 'icon');
  icon.dataset.icon = 'tick';
  btn.append(icon);
  btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (onChange) onChange(on);
    drawAll();                       // redraw so the box fills (or empties)
  });
  return btn;
}

const BEATS = {

  /* GUIDED TRY: an ordered list. Data: steps: ['...', '...'] */
  try(page) {
    const list = make('ol', 'try-steps');
    (page.steps || []).forEach(text => list.append(make('li', '', text)));
    return list;
  },

  /* YOUR TURN: one drawn card per exercise, side by side (stacked on a phone).
     Data: exercises: [{ title, text, easier, harder }]
     Each card: a letter and name, a tick square in the corner, the words, a
     pencil line, then the Easier and Harder hints at the bottom. */
  turn(page, lesson, n) {
    const list = page.exercises || [];
    const wrap = make('div', 'turn-list');
    wrap.style.setProperty('--cols', Math.max(1, list.length));   // 2 or 3 columns
    list.forEach((ex, i) => {
      const letter = String.fromCharCode(65 + i);                 // A, B, C
      const card = make('section', 'turn-card');
      card.dataset.drawn = 'box';
      card.dataset.seed = 'ex' + lesson + '-' + n + '-' + i;

      const head = make('div', 'turn-head');
      head.append(make('h3', '', letter + ' · ' + ex.title),
                  makeTick('Mark exercise ' + letter + ' as done', 'tk' + lesson + '-' + n + '-' + i, 'tick-corner'));
      card.append(head, make('p', 'turn-text', ex.text));

      /* A pencil line, then the two hints pushed to the bottom of the card. */
      const hints = make('div', 'turn-hints');
      const line = make('span', 'turn-rule');
      line.dataset.drawn = 'rule';
      line.dataset.seed = 'tr' + lesson + '-' + n + '-' + i;
      hints.append(line);
      [['Easier: ', ex.easier], ['Harder: ', ex.harder]].forEach(([label, words]) => {
        if (!words) return;
        const hint = make('p', 'note hint');
        hint.append(make('strong', '', label), words);
        hints.append(hint);
      });
      card.append(hints);
      wrap.append(card);
    });
    return wrap;
  },

  /* PRACTICE: repetition made visible. A row of blank "pages" to tick off, and
     one drawing of what a full page looks like.
     Data: count (how many pages, e.g. 5), hint (a short line), figure: { art, caption }
     The task itself is the page's intro (above). Not every lesson has a Practice page. */
  practice(page, lesson, n) {
    const count = page.count || 5;
    const wrap = make('div', 'practice');

    /* Left: the pages to tick, a running count, a hint. */
    const left = make('div', 'practice-left');
    const row = make('div', 'practice-pages');
    const counter = make('p', 'note practice-count', '0 of ' + count + ' pages');
    let done = 0;
    for (let i = 1; i <= count; i++) {
      const cell = make('div', 'practice-cell');
      const tick = makeTick('Mark page ' + i + ' as done', 'pg' + lesson + '-' + n + '-' + i, 'tick-page', on => {
        done += on ? 1 : -1;
        counter.textContent = done + ' of ' + count + ' pages';
      });
      cell.append(tick, make('span', 'note', 'page ' + i));
      row.append(cell);
    }
    left.append(row, counter);
    if (page.hint) left.append(make('p', 'note', page.hint));
    wrap.append(left);

    /* Right: the one main drawing, "what a full page looks like". */
    if (page.figure) {
      const fig = make('figure', 'frame practice-fig');
      const art = make('div', 'art');
      art.dataset.drawn = 'box';
      art.dataset.seed = 'pfig' + lesson + '-' + n;
      art.innerHTML = stepArt(page.figure.art, (lesson * 100 + n * 10) * 13);   // our own SVG, not user text
      fig.append(art, make('figcaption', '', page.figure.caption));
      wrap.append(fig);
    }
    return wrap;
  },

  /* REFLECT (wireframe 4C): two halves with a pencil line between.
     Left: the question and a plain "room to think" box. Right: Look first, with a
     drawn box for a real object or drawing to study.
     Data: question, boxLabel, lookFirst: { heading, text, caption, art (optional) }
     The text box is plain and NOT saved yet (the journal comes in Step 7). */
  reflect(page, lesson, n) {
    const wrap = make('div', 'reflect');

    /* Left half: Reflect */
    const left = make('div', 'reflect-left');
    left.append(make('h2', '', page.question));
    /* A textarea cannot hold a drawn SVG, so the pencil border goes on a wrapper. */
    const box = make('div', 'reflect-box');
    box.dataset.drawn = 'box';
    box.dataset.seed = 'reflect' + lesson + '-' + n;
    const label = make('label', 'note', page.boxLabel || '');
    label.htmlFor = 'reflect-text';
    const area = make('textarea');
    area.id = 'reflect-text';
    area.rows = 6;
    box.append(label, area);
    left.append(box);
    wrap.append(left);

    /* The line between the halves (it turns horizontal on a phone). */
    const mid = make('span', 'reflect-rule');
    mid.dataset.drawn = 'rule';
    mid.dataset.seed = 'reflect-mid';
    wrap.append(mid);

    /* Right half: Look first */
    const look = page.lookFirst;
    if (look) {
      const right = make('div', 'reflect-right');
      right.append(make('h3', '', look.heading), make('p', '', look.text));
      const fig = make('figure', 'frame');
      const art = make('div', 'art');
      art.dataset.drawn = 'box';
      art.dataset.seed = 'look' + lesson + '-' + n;
      art.innerHTML = stepArt(look.art || 1, (lesson * 100 + n * 10) * 17);   // placeholder drawing; yours replaces it later
      fig.append(art);
      if (look.caption) fig.append(make('figcaption', '', look.caption));
      right.append(fig);
      wrap.append(right);
    }
    return wrap;
  },

  /* NEXT (wireframe 4D): what comes next and why, a big button to the next lesson,
     and a small path of dots (the same idea as the Contents page).
     Data: why (a few words on why the next lesson follows). The page title and intro
     are yours: for example "Line work finished" and a line about what you did.
     (The "+10 points saved" tag from the wireframe waits for points, Step 7.) */
  next(page, lesson, n) {
    const lessons = window.PENCAVE_LESSONS;
    const here = lessons[lesson];
    const after = lessons[lesson + 1];
    const wrap = make('div', 'next-page');

    /* Left: what is next, why, and the big button. */
    const left = make('div', 'next-left');
    left.append(make('h2', '', 'Next: ' + here.next));
    if (page.why) left.append(make('p', '', page.why));
    const go = make('a', 'btn primary big next-go');
    go.href = after ? placeLink(lesson + 1, 1) : '#contents';
    go.dataset.drawn = 'box';
    go.dataset.fill = 'solid';
    go.dataset.seed = 'next-go';
    go.append(after ? 'Next lesson: ' + here.next : 'Back to Contents');
    const arrow = make('i', 'icon');
    arrow.dataset.icon = 'arrow-right';
    go.append(arrow);
    left.append(go);
    wrap.append(left);

    /* Right: three dots. This lesson (finished, filled), the next one (ringed), the one after (empty). */
    const path = make('ol', 'toc mini-toc');
    const line = make('span', 'toc-line');
    line.dataset.drawn = 'rule'; line.dataset.seed = 'mini-line'; line.dataset.weight = '2';
    path.append(line);
    [[lesson, true, false], [lesson + 1, false, true], [lesson + 2, false, false]].forEach(([num, done, ring]) => {
      const l = lessons[num];
      if (!l) return;
      const row = make('li', 'toc-row');
      row.append(makeDot(done, ring), make('span', 'toc-link', l.title));
      path.append(row);
    });
    wrap.append(path);
    return wrap;
  }
};
