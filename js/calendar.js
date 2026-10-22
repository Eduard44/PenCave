/* =====================================================================
   calendar.js  (the calendar: the year strip and the month view)
   Built from the component sheet (calendar marks) and wireframes 5 and 5b.
   One mark per day, the strongest:
     empty  nothing        dot    a lesson only
     light  a note         dense  an outstanding note
   The longest run of marked days in a row gets a heavy outline. No "missed" words.
   Weeks start on Monday.

   YEAR STRIP: 8 pixels a day, 53 week-columns, ending with this week. Click a day to
   read its notes. Click a month name for the month view.
   MONTH VIEW: the address #progress/2026-10. Bigger cells, with words.

   Needs progress.js (dayInfo, longestRun, state), journal.js (buildNoteRow, dayLabel),
   draw.js (lineD, COLORS, drawAll) and book.js (make, render).
   ===================================================================== */

const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = MONTHS_LONG.map(m => m.slice(0, 3));

/* The day the reader last picked (a day text like '2026-10-21'). It is kept while the
   page redraws, so editing a note does not jump back to today. null = today. */
let calPick = null;

/* ---------- small date helpers (local time) ---------- */
const two = n => String(n).padStart(2, '0');
const dayText = d => d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const mondayRow = d => (d.getDay() + 6) % 7;                 // Monday 0 ... Sunday 6

/* ---------- one day's mark, drawn as a small square (as in the component sheet) ----------
   Hatching is a set of diagonal strokes clipped to the square by simple maths,
   each with a tiny wobble seeded by the date, so a mark never changes. */
function dayCell(x, y, s, kind, seed, heavy) {
  const G = COLORS.graphite;
  let out = '<rect x="' + (x + 0.5) + '" y="' + (y + 0.5) + '" width="' + (s - 1) + '" height="' + (s - 1) + '" fill="none" stroke="' + COLORS.rule + '" stroke-width="0.8"/>';
  if (kind === 'dot') {
    out += '<circle cx="' + (x + s / 2) + '" cy="' + (y + s / 2) + '" r="' + Math.max(1.3, s * 0.17).toFixed(2) + '" fill="' + G + '"/>';
  } else if (kind === 'light' || kind === 'dense') {
    const spacing = kind === 'light' ? s / 2 : s / 3.4;
    let k = 0;
    for (let d = -s + spacing; d < s; d += spacing) {
      const t0 = Math.max(0, -d), t1 = Math.min(s, s - d);   // the part of this diagonal inside the square
      if (t1 - t0 < 0.8) continue;
      out += '<path d="' + lineD(x + d + t0, y + s - t0, x + d + t1, y + s - t1, seed * 31 + k, 0.22) + '" stroke="' + G + '" stroke-width="1" fill="none" stroke-linecap="round"/>';
      k++;
    }
  }
  if (heavy) out += '<rect x="' + (x + 0.2) + '" y="' + (y + 0.2) + '" width="' + (s - 0.4) + '" height="' + (s - 0.4) + '" fill="none" stroke="' + G + '" stroke-width="1.8"/>';
  return out;
}
/* The same mark as a little stand-alone picture (for the legend and the month cells). */
function markSvg(kind, s, seed, heavy) {
  return '<svg width="' + (s + 4) + '" height="' + (s + 4) + '" viewBox="-2 -2 ' + (s + 4) + ' ' + (s + 4) + '" aria-hidden="true" focusable="false">' + dayCell(0, 0, s, kind, seed, heavy) + '</svg>';
}
const daySeed = d => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();   // 20261021: stable per date

/* ---------- the notes for one day (under the calendar) ---------- */
function showDayNotes(box, day, rerender) {
  box.replaceChildren();
  box.append(make('h3', 'note-day', 'Notes for: ' + dayLabel(day)));
  const info = dayInfo(day);
  info.lessons.forEach(n => {
    const l = window.PENCAVE_LESSONS[n];
    if (l) box.append(make('p', 'note', 'Lesson ' + n + ' · ' + l.title + ': finished or repeated'));
  });
  if (!info.notes.length) box.append(make('p', 'note', 'Nothing written this day.'));
  info.notes.forEach(n => box.append(buildNoteRow(n, rerender)));
  drawAll(); watchAll();
}
/* The one place a day gets picked: remember it and show its notes. */
function pickDay(box, day) {
  calPick = day;
  showDayNotes(box, day, render);
  document.querySelectorAll('.day-cell').forEach(c => c.classList.toggle('is-picked', c.dataset.day === day));
}

/* ---------- the legend: what each mark means ---------- */
function buildLegend() {
  const wrap = make('div', 'marks');
  [['empty', 'no note'], ['dot', 'lesson only'], ['light', 'a note'], ['dense', 'an outstanding note'], ['heavy', 'longest run']].forEach((it, i) => {
    const item = make('span', 'mark-item');
    item.innerHTML = markSvg(it[0] === 'heavy' ? 'light' : it[0], 16, 40 + i, it[0] === 'heavy');   // our own SVG, not user text
    item.append(it[1]);
    wrap.append(item);
  });
  return wrap;
}

/* ---------- THE YEAR STRIP ---------- */
function buildYear(notesBox) {
  const s = 8, gap = 2, step = s + gap, cols = 53, rows = 7;
  const today = new Date();
  const todayRow = mondayRow(today);
  /* The first column starts on the Monday 52 weeks before this week's Monday. */
  const start = addDays(today, -todayRow - 52 * 7);
  const run = longestRun();

  const wrap = make('div', 'year');
  const scroller = make('div', 'strip-wrap');             // slides sideways if the screen is narrow
  scroller.tabIndex = 0;
  scroller.setAttribute('role', 'region');
  scroller.setAttribute('aria-label', 'Your year, one small square per day. Scrolls sideways.');
  const inner = make('div', 'strip-inner');
  inner.style.width = cols * step + 'px';

  /* Month names above the strip: each is a button that opens that month. A name sits
     above the column where the month's first day falls. */
  const names = make('div', 'month-names');
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const d = addDays(start, c * 7 + r);
      if (d.getDate() === 1 && d <= today) {
        const b = make('button', 'month-btn', MONTHS_SHORT[d.getMonth()]);
        b.type = 'button';
        b.style.left = c * step + 'px';
        b.setAttribute('aria-label', 'Open ' + MONTHS_LONG[d.getMonth()] + ' ' + d.getFullYear());
        b.addEventListener('click', () => { location.hash = '#progress/' + d.getFullYear() + '-' + two(d.getMonth() + 1); });
        names.append(b);
      }
    }
  }
  inner.append(names);

  /* The squares themselves, one SVG. */
  let out = '';
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const d = addDays(start, c * 7 + r);
      if (d > today) continue;                              // days still to come are left blank
      const key = dayText(d);
      out += dayCell(c * step, r * step, s, dayInfo(key).mark, daySeed(d), run.days.has(key));
    }
  }
  const W = cols * step, H = rows * step;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', W); svg.setAttribute('height', H);
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Your year of practice marks. The month names above open a month, with every day in words.');
  svg.classList.add('year-svg');
  svg.innerHTML = out;
  /* Click a day: work out which square from where the click landed. */
  svg.addEventListener('click', e => {
    const box = svg.getBoundingClientRect();
    const col = Math.floor((e.clientX - box.left) / step), row = Math.floor((e.clientY - box.top) / step);
    if (col < 0 || row < 0 || col >= cols || row >= rows) return;
    const d = addDays(start, col * 7 + row);
    if (d > today) return;
    pickDay(notesBox, dayText(d));
  });
  inner.append(svg);
  scroller.append(inner);
  wrap.append(scroller);

  wrap.append(buildLegend());
  wrap.append(make('p', 'note', 'Click a day to read its notes below. Click a month name for a bigger view. One mark per day here: the strongest.'));
  /* Start scrolled to the right end, so this week is in view on a phone. */
  requestAnimationFrame(() => { scroller.scrollLeft = scroller.scrollWidth; });
  return wrap;
}

/* ---------- THE MONTH VIEW (wireframe 5b) ---------- */
function buildMonth(year, month) {
  month = Math.min(12, Math.max(1, month));
  const today = new Date();
  const first = new Date(year, month - 1, 1);
  const daysIn = new Date(year, month, 0).getDate();
  const run = longestRun();
  const wrap = make('div', 'month-page');

  /* Back link, then the title with the previous and next month either side. */
  const back = make('a', 'month-back', 'Back to your year');
  back.href = '#progress';
  const arrow = make('i', 'icon'); arrow.dataset.icon = 'arrow-left';
  back.prepend(arrow, ' ');
  wrap.append(back);

  const head = make('div', 'month-head');
  head.append(make('h1', 'page-title', MONTHS_LONG[month - 1] + ' ' + year));
  const nav = make('div', 'month-nav');
  const prev = new Date(year, month - 2, 1), next = new Date(year, month, 1);
  const prevLink = make('a', '', '‹ ' + MONTHS_LONG[prev.getMonth()]);
  prevLink.href = '#progress/' + prev.getFullYear() + '-' + two(prev.getMonth() + 1);
  nav.append(prevLink);
  if (next <= today) {                                       // no months beyond this one
    const nextLink = make('a', '', MONTHS_LONG[next.getMonth()] + ' ›');
    nextLink.href = '#progress/' + next.getFullYear() + '-' + two(next.getMonth() + 1);
    nav.append(nextLink);
  }
  head.append(nav);
  wrap.append(head);

  const notesBox = make('div', 'day-notes');
  const grid = make('div', 'month-grid');
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach(n => grid.append(make('p', 'note month-dow', n)));
  for (let i = 0; i < mondayRow(first); i++) grid.append(make('span', 'day-blank'));   // days before the 1st

  for (let n = 1; n <= daysIn; n++) {
    const d = new Date(year, month - 1, n);
    const key = dayText(d);
    if (d > today) { grid.append(make('span', 'day-blank')); continue; }   // days still to come
    const info = dayInfo(key);
    const bits = [];
    if (info.notes.length) bits.push(info.notes.length + (info.notes.length === 1 ? ' note' : ' notes'));
    if (info.lessons.length) bits.push('lesson');
    const isToday = key === dayText(today);
    const words = bits.join(' + ') || (isToday ? 'today' : '');

    const cell = make('button', 'day-cell');
    cell.type = 'button';
    cell.dataset.drawn = 'box';
    cell.dataset.seed = 'day' + key;
    cell.dataset.day = key;
    cell.setAttribute('aria-label', n + ' ' + MONTHS_LONG[month - 1] + (bits.length ? ', ' + bits.join(' and ') : ', nothing written') + (isToday ? ', today' : ''));
    cell.append(make('span', 'day-n', String(n)));
    const marks = make('span', 'day-marks');
    /* The strongest mark; a day with a lesson AND notes also shows the lesson dot beside it. */
    marks.innerHTML = markSvg(info.mark, 20, daySeed(d), run.days.has(key)) +
                      (info.lessons.length && info.notes.length ? markSvg('dot', 20, daySeed(d) + 7, false) : '');   // our own SVG
    cell.append(marks, make('span', 'note day-words', words));
    cell.addEventListener('click', () => pickDay(notesBox, key));
    grid.append(cell);
  }
  wrap.append(grid, buildLegend(), notesBox);

  /* Start with the picked day if it is in this month, otherwise today, otherwise the 1st. */
  const inMonth = d => d && d.slice(0, 7) === year + '-' + two(month);
  const todayKey = dayText(today);
  const startDay = inMonth(calPick) ? calPick : (inMonth(todayKey) ? todayKey : dayText(first));
  setTimeout(() => pickDay(notesBox, startDay), 0);          // after the page is in place, so the cells exist
  return wrap;
}
