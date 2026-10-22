/* =====================================================================
   journal.js  (the practice journal)
   The pieces for writing, editing and deleting a practice note:
     buildNoteForm   a text box, a rating (1 or 2) and a button; used for
                     adding AND editing
     openNoteBox     the same form in a small box, opened from the Practice
                     and Reflect pages (tagged with the lesson)
     makeNoteButton  the "Add a note to my journal" button for those pages
     buildNoteList   every note, newest day first, each with Edit and Delete
   The notes themselves, and the points rule, live in progress.js.
   Needs make() from book.js and drawAll() from draw.js.
   ===================================================================== */

const RATING_LABELS = { 1: '1 · Just practising', 2: '2 · Something outstanding' };

/* The form. opts:
     note      give an existing note to EDIT it (leave out to add a new one)
     lesson    the lesson number to tag a new note with (optional)
     onDone    runs after saving: onDone(note, scored)
     onCancel  if given, a Cancel button is shown */
function buildNoteForm(opts) {
  const editing = !!opts.note;
  const form = make('div', 'note-form');

  /* The text box. A textarea cannot hold a drawn border, so the border goes on a wrapper. */
  const field = make('div', 'field');
  field.dataset.drawn = 'box';
  field.dataset.seed = 'note-field';
  const area = make('textarea', 'text-area');
  area.rows = 4;
  area.placeholder = 'What did you practise today?';
  area.setAttribute('aria-label', 'What did you practise today?');
  if (editing) area.value = opts.note.text;
  field.append(area);
  form.append(field);

  /* The rating: two buttons, one picked at a time. The picked one fills solid (draw.js). */
  let rating = editing ? opts.note.rating : 1;
  const ratings = make('div', 'jrow');
  ratings.setAttribute('role', 'group');
  ratings.setAttribute('aria-label', 'How did it go?');
  const chips = [1, 2].map(n => {
    const b = make('button', 'btn', RATING_LABELS[n]);
    b.type = 'button';
    b.dataset.drawn = 'box';
    b.dataset.seed = 'rate' + n;
    b.setAttribute('aria-pressed', n === rating ? 'true' : 'false');
    b.addEventListener('click', () => {
      rating = n;
      chips.forEach((c, i) => c.setAttribute('aria-pressed', i + 1 === n ? 'true' : 'false'));
      drawAll();                                    // redraw so the picked one fills
    });
    return b;
  });
  ratings.append(...chips);
  form.append(ratings);

  /* A gentle message if the box is empty. */
  const msg = make('p', 'note');
  msg.setAttribute('role', 'alert');
  msg.hidden = true;

  const go = make('button', 'btn', editing ? 'Save' : 'Add note');
  go.type = 'button';
  go.dataset.drawn = 'box';
  go.dataset.seed = 'note-go';
  go.addEventListener('click', () => {
    const text = area.value.trim();
    if (!text) { msg.textContent = 'Write a line first.'; msg.hidden = false; area.focus(); return; }
    if (editing) {
      editNote(opts.note.id, text, rating);
      if (opts.onDone) opts.onDone(opts.note, false);
    } else {
      const result = addNote(text, rating, opts.lesson);   // progress.js
      if (opts.onDone) opts.onDone(result.note, result.scored);
    }
  });
  const actions = make('div', 'jrow');
  actions.append(go);
  if (opts.onCancel) {
    const cancel = make('button', 'link-button', 'Cancel');
    cancel.type = 'button';
    cancel.addEventListener('click', opts.onCancel);
    actions.append(cancel);
  }
  form.append(actions, msg);
  form.area = area;                                  // so the caller can focus the text box
  return form;
}

/* The small box for the Practice and Reflect pages. Built the first time, then reused. */
function openNoteBox(lesson) {
  let box = document.getElementById('note-box');
  if (!box) {
    box = make('dialog', 'collect-box note-box');   // same look as the Collect box
    box.id = 'note-box';
    box.setAttribute('aria-label', 'Add a note to my journal');
    const body = make('div', 'note-body');
    body.dataset.drawn = 'box';
    body.dataset.fill = 'paper';
    body.dataset.seed = 'note-box';
    box.append(body);
    document.body.append(box);
    box.body = body;
  }
  const body = box.body;
  body.replaceChildren();
  body.append(make('h3', '', 'Add a note to my journal'));
  const l = window.PENCAVE_LESSONS[lesson];
  if (l) body.append(make('p', 'note', 'Lesson ' + l.number + ' · ' + l.title));

  const form = buildNoteForm({
    lesson: lesson,
    onCancel: () => box.close(),
    onDone: (note, scored) => {
      if (scored) {                                  // it earned points: show them straight away
        box.close();
        openCollect();
      } else {                                       // an extra note: saved, no points, say so
        body.replaceChildren();
        body.append(make('h3', '', 'Saved to your journal'),
                    make('p', 'note', 'Extra notes each day are free and add no points.'));
        const done = make('button', 'btn primary', 'Done');
        done.type = 'button';
        done.dataset.drawn = 'box'; done.dataset.fill = 'solid'; done.dataset.seed = 'note-done';
        done.addEventListener('click', () => box.close());
        const row = make('div', 'jrow'); row.append(done);
        body.append(row);
        drawAll(); watchAll();
        done.focus();
      }
    }
  });
  body.append(form);
  box.showModal();
  drawAll(); watchAll();
  form.area.focus();
}

/* The button on the Practice and Reflect pages. */
function makeNoteButton(lesson) {
  const b = make('button', 'btn note-button', 'Add a note to my journal');
  b.type = 'button';
  b.dataset.drawn = 'box';
  b.dataset.seed = 'note-open';
  b.addEventListener('click', () => openNoteBox(lesson));
  return b;
}

/* ---------- The list of notes ---------- */

/* "2026-10-21" -> "Today", or "Wed 21 Oct". */
function dayLabel(day) {
  if (day === todayText()) return 'Today';
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

/* One note: time, words, rating ring, and Edit / Delete. "rerender" redraws the page. */
function buildNoteRow(note, rerender) {
  const row = make('div', 'note-row');
  row.append(make('time', '', note.time));

  const mid = make('div', 'note-mid');
  mid.append(make('p', 'note-text', note.text));
  const l = note.lesson && window.PENCAVE_LESSONS[note.lesson];
  if (l) mid.append(make('p', 'note', 'Lesson ' + l.number + ' · ' + l.title));

  const acts = make('div', 'note-acts');
  const edit = make('button', 'link-button', 'Edit');
  edit.type = 'button';
  edit.addEventListener('click', () => {
    row.replaceChildren(buildNoteForm({ note: note, onDone: rerender, onCancel: rerender }));
    drawAll(); watchAll();
  });
  const del = make('button', 'link-button', 'Delete');
  del.type = 'button';
  del.addEventListener('click', () => {
    /* Ask first. Points already earned stay either way. */
    acts.replaceChildren(make('span', 'note', 'Delete this note? Points you earned stay.'));
    const yes = make('button', 'link-button', 'Delete');
    yes.type = 'button';
    yes.addEventListener('click', () => { deleteNote(note.id); rerender(); });
    const no = make('button', 'link-button', 'Keep');
    no.type = 'button';
    no.addEventListener('click', rerender);
    acts.append(yes, no);
  });
  acts.append(edit, del);
  mid.append(acts);

  const rate = make('span', 'rating', String(note.rating));
  rate.dataset.drawn = 'ring';
  rate.dataset.seed = 'rating' + note.id;
  rate.setAttribute('aria-label', 'Rated ' + note.rating);
  row.append(mid, rate);
  return row;
}

/* Every note, newest day first. Within a day, oldest first (the order you wrote them). */
function buildNoteList(rerender) {
  const wrap = make('div', 'note-list');
  if (!state.notes.length) {
    wrap.append(make('p', 'note', 'No notes yet. Write one after you practise.'));
    return wrap;
  }
  const days = [...new Set(state.notes.map(n => n.day))].sort().reverse();
  days.forEach(day => {
    wrap.append(make('h3', 'note-day', dayLabel(day)));
    state.notes.filter(n => n.day === day).forEach(n => wrap.append(buildNoteRow(n, rerender)));
  });
  return wrap;
}
