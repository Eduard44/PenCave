/* =====================================================================
   draw.js  (the drawing engine)
   Draws the hand-drawn pencil lines on the site: borders, dividers,
   circles, the bookmark ribbon and the small icons.
   In C# terms: one small static class that every component calls.

   How it works: any HTML element with  data-drawn="..."  gets a wobbly
   SVG picture laid BEHIND it. The drawing is redrawn when the element
   changes size. If JavaScript fails, a plain CSS border is shown instead
   (see drawn.css), so nothing breaks.

   data- attributes you can put on an element:
     data-drawn  = box | dashed | bar | ring | rule | vrule | ribbon
     data-seed   = any text. Same seed = same wobble every time.
     data-color  = graphite (default) | blue | red | locked | rule
     data-weight = line thickness in pixels
     data-fill   = solid | paper   (box only: fills the shape in)
     data-value  = 0 to 1 (bar and ribbon: how full)
   ===================================================================== */

/* ---------- Tidiness ----------
   0 = sketchy (a faint second pass and pencil grain), 1 = clean.
   Later, this will come from how many lessons the learner has finished. */
const ink = { level: 0 };
const tidy = () => ink.level / 5;   // turns the 0-5 level into 0-1

/* ---------- Colours ----------
   We read them from tokens.css so the colours live in ONE place.
   The second value in each pair is a backup in case the read fails. */
const css = getComputedStyle(document.documentElement);
const token = (name, backup) => css.getPropertyValue(name).trim() || backup;
const COLORS = {
  graphite: token('--graphite', '#2A2E33'),
  blue:     token('--blue',     '#6F93B8'),
  red:      token('--red',      '#B8504A'),
  locked:   token('--locked',   '#5A5A5A'),
  rule:     token('--rule',     '#767676'),
  paper:    token('--paper',    '#E8EBEE')
};

/* ---------- A random number generator with a memory ----------
   Math.random() gives different numbers every visit. This one gives the
   SAME numbers for the same seed, so a line always wobbles the same way. */
function makeRandom(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* Turns any text (like "bar-under") into a number we can use as a seed. */
function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/* ---------- A wobbly line ----------
   Walk from the start to the end in short steps, push each point a little
   sideways, then join the points with smooth curves.
   "amp" is the most a point may drift sideways, in pixels. */
function lineD(x1, y1, x2, y2, seed, amp) {
  const rand = makeRandom(seed);
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 0.5) return '';
  const steps = Math.max(2, Math.round(len / 36));        // one point about every 36px
  const nx = -(y2 - y1) / len, ny = (x2 - x1) / len;      // the "sideways" direction
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const edge = (i === 0 || i === steps) ? 0.4 : 1;      // the ends wobble less
    const off = (rand() - 0.5) * 2 * amp * edge;
    pts.push([x1 + (x2 - x1) * t + nx * off, y1 + (y2 - y1) * t + ny * off]);
  }
  return smooth(pts);
}

/* Joins a list of points into one smooth SVG path ("d" is SVG's path text). */
function smooth(pts) {
  let d = 'M' + pts[0][0].toFixed(2) + ' ' + pts[0][1].toFixed(2);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ' Q' + pts[i][0].toFixed(2) + ' ' + pts[i][1].toFixed(2) + ' ' + mx.toFixed(2) + ' ' + my.toFixed(2);
  }
  return d + ' L' + pts[pts.length - 1][0].toFixed(2) + ' ' + pts[pts.length - 1][1].toFixed(2);
}

/* A rectangle: four wobbly sides, each running a little past the corner
   ("over" pixels), like a real hand. */
function rectDs(x, y, w, h, seed, amp, over) {
  return [
    lineD(x - over, y, x + w + over, y, seed + 1, amp),
    lineD(x + w, y - over, x + w, y + h + over, seed + 2, amp),
    lineD(x + w + over, y + h, x - over, y + h, seed + 3, amp),
    lineD(x, y + h + over, x, y - over, seed + 4, amp)
  ];
}

/* A circle drawn slightly more than once round (1.04 turns), so the ends overlap. */
function circleD(cx, cy, r, seed, amp) {
  const rand = makeRandom(seed);
  const total = 26, sweep = Math.PI * 2 * 1.04, pts = [];
  for (let i = 0; i <= total; i++) {
    const a = -Math.PI / 2 + (sweep * i) / total;
    const rr = r + (rand() - 0.5) * 2 * amp + (i / total) * Math.min(0.8, r * 0.05);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return smooth(pts);
}

/* ---------- Pencil grain on a stroke ----------
   An SVG noise filter that cuts the stroke into a see-through speckle.
   At full tidiness it returns nothing, so there is no grain.
   Text is NEVER drawn through this filter. */
function grainFilter(id, w, h, seedNum) {
  const t = tidy();
  if (t >= 0.999) return '';
  const a = (2.4 * (1 - t)).toFixed(3), b = (-0.55 * (1 - t) + t).toFixed(3);
  return '<filter id="' + id + '" filterUnits="userSpaceOnUse" x="-6" y="-6" width="' + (w + 12) + '" height="' + (h + 12) + '">' +
    '<feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="' + seedNum + '" result="n"/>' +
    '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ' + a + ' 0 0 0 ' + b + '" result="m"/>' +
    '<feComposite in="SourceGraphic" in2="m" operator="in"/></filter>';
}

/* ---------- Draw one element ----------
   Reads the element's size, then lays a wobbly-line SVG behind it. */
let uid = 0;   // a counter so each element gets its own number
function draw(el) {
  const w = el.offsetWidth, h = el.offsetHeight;   // the element's size in pixels
  if (w < 3 || h < 1) return;                      // hidden or empty: nothing to draw
  if (!el.__n) el.__n = ++uid;
  const shape = el.dataset.drawn;
  const seed = hashString(el.dataset.seed || ('e' + el.__n));
  const color = COLORS[el.dataset.color || 'graphite'];
  const weight = Number(el.dataset.weight || 1.6);
  const dash = el.dataset.dash ? ' stroke-dasharray="' + el.dataset.dash + '"' : '';
  const t = tidy();
  const ghostOpacity = el.dataset.dash ? 0 : 0.45 * (1 - t);   // the faint second pass

  /* pen() makes the main line. ghost() makes the faint, thinner second pass. */
  const pen = (d, c, wt) => '<path d="' + d + '" stroke="' + (c || color) + '" stroke-width="' + (wt || weight) + '"' + dash + ' fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  const ghost = (d, c, wt) => ghostOpacity < 0.01 ? '' : '<path d="' + d + '" stroke="' + (c || color) + '" stroke-width="' + ((wt || weight) * 0.55) + '" stroke-opacity="' + ghostOpacity.toFixed(3) + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';

  let under = '';    // solid fills: drawn first, with NO grain, so text on top stays readable
  let strokes = '';  // pencil lines: drawn with grain
  const amp = Math.min(0.9, 0.35 + Math.min(w, h) / 30);   // small things wobble less

  if (shape === 'box' || shape === 'dashed' || shape === 'bar') {
    const over = el.dataset.dash ? 1.5 : 3;
    rectDs(0, 0, w, h, seed, amp, over).forEach(d => { strokes += pen(d); });
    rectDs(0, 0, w, h, seed + 500, amp * 1.2, over).forEach(d => { strokes += ghost(d); });
    /* A picked chip (aria-pressed="true") is filled like a main button. */
    const fillKind = el.getAttribute('aria-pressed') === 'true' ? 'solid' : el.dataset.fill;
    if (fillKind === 'solid' || fillKind === 'paper') {
      /* A hand-filled shape: corners nudged so the edge is not ruler-straight. */
      const r = makeRandom(seed + 77), j = () => (r() - 0.5) * 2.2;
      const fillColor = fillKind === 'solid' ? COLORS.graphite : COLORS.paper;
      under += '<path d="M' + j().toFixed(1) + ' ' + j().toFixed(1) + ' L' + (w + j()).toFixed(1) + ' ' + j().toFixed(1) +
               ' L' + (w + j()).toFixed(1) + ' ' + (h + j()).toFixed(1) + ' L' + j().toFixed(1) + ' ' + (h + j()).toFixed(1) +
               ' Z" fill="' + fillColor + '"/>';
    }
    if (shape === 'bar') {
      /* The filled part of a progress bar: one thick pencil stroke. */
      const v = Math.max(0, Math.min(1, Number(el.dataset.value || 0)));
      if (v > 0) strokes += pen(lineD(4, h / 2, 4 + (w - 8) * v, h / 2, seed + 9, 0.5), color, Math.max(4, h - 8));
    }
  } else if (shape === 'ring') {
    /* A circle, such as the avatar. */
    const r = Math.min(w, h) / 2 - 1.5;
    strokes += pen(circleD(w / 2, h / 2, r, seed, Math.min(0.9, r * 0.1 + 0.3)));
    strokes += ghost(circleD(w / 2, h / 2, r + 0.5, seed + 500, Math.min(1, r * 0.12 + 0.3)));
  } else if (shape === 'rule' || shape === 'vrule') {
    /* A divider that works either way round: wider than tall = horizontal,
       taller than wide = vertical. So a vertical divider turns horizontal on
       a phone just by changing its size. */
    if (w >= h) {
      strokes += pen(lineD(0, h / 2, w, h / 2, seed, 0.9));
      strokes += ghost(lineD(0, h / 2 + 0.6, w, h / 2 + 0.6, seed + 500, 1.1));
    } else {
      strokes += pen(lineD(w / 2, 0, w / 2, h, seed, 0.9));
      strokes += ghost(lineD(w / 2 + 0.6, 0, w / 2 + 0.6, h, seed + 500, 1.1));
    }
  } else if (shape === 'ribbon') {
    /* The bookmark ribbon: an outline with a notch, filled from the top by "value" (0 to 1). */
    const v = Math.max(0, Math.min(1, Number(el.dataset.value || 0)));
    const n = h - 12;   // where the tip of the notch sits
    const pts = [[1, 0], [w - 1, 0], [w - 1, h - 1], [w / 2, n], [1, h - 1], [1, 0]];
    const cid = 'rc' + el.__n;
    under += '<clipPath id="' + cid + '"><rect x="0" y="0" width="' + w + '" height="' + (h * v).toFixed(1) + '"/></clipPath>' +
             '<path d="M1 0 L' + (w - 1) + ' 0 L' + (w - 1) + ' ' + (h - 1) + ' L' + w / 2 + ' ' + n + ' L1 ' + (h - 1) + ' Z" fill="' + COLORS.graphite + '" clip-path="url(#' + cid + ')"/>';
    for (let i = 0; i < pts.length - 1; i++) strokes += pen(lineD(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], seed + i, 0.5), color, 1.8);
  }

  /* Put it together: filters, solid fills, then the grainy pencil lines on top. */
  const fid = 'pf' + el.__n;
  const filter = grainFilter(fid, w, h, (seed % 90) + 1);
  const markup = '<defs>' + filter + '</defs>' + under + '<g' + (filter ? ' filter="url(#' + fid + ')"' : '') + '>' + strokes + '</g>';

  /* Find this element's drawing, or make it the first time. */
  let svg = el.querySelector(':scope > svg.ink');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'ink');
    svg.setAttribute('aria-hidden', 'true');   // screen readers skip decoration
    svg.setAttribute('focusable', 'false');
    el.prepend(svg);
  }
  svg.setAttribute('viewBox', '-6 -6 ' + (w + 12) + ' ' + (h + 12));   // 6px of room for overshoot
  svg.style.width = (w + 12) + 'px';
  svg.style.height = (h + 12) + 'px';
  svg.innerHTML = markup;
}

/* ---------- Icons ----------
   Atkinson has no arrows, menu icon, play triangle or tick, so we draw them.
   Each icon is a list of lines [x1, y1, x2, y2] on a 20 by 20 grid.
   Use:  <i class="icon" data-icon="menu"></i> */
const ICONS = {
  'arrow-right': [[3, 10, 16, 10], [11, 4, 17, 10], [11, 16, 17, 10]],
  'arrow-left':  [[17, 10, 4, 10], [9, 4, 3, 10], [9, 16, 3, 10]],
  'menu':        [[3, 5, 17, 5], [3, 10, 17, 10], [3, 15, 17, 15]],
  'pause':       [[7, 3, 7, 17], [13, 3, 13, 17]],
  'tick':        [[4, 10, 8, 15], [8, 15, 17, 4]]
};
function drawIcons() {
  document.querySelectorAll('.icon[data-icon]').forEach(el => {
    const name = el.dataset.icon;
    let inner = '';
    if (name === 'play') {
      inner = '<path d="M6 3 L17 10 L6 17 Z" fill="currentColor" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>';
    } else {
      (ICONS[name] || []).forEach((l, i) => {
        inner += '<path d="' + lineD(l[0], l[1], l[2], l[3], hashString(name) + i, 0.35) + '" stroke="currentColor" stroke-width="1.9" fill="none" stroke-linecap="round"/>';
      });
    }
    el.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">' + inner + '</svg>';
  });
}

/* ---------- Start-up ----------
   drawAll() draws every [data-drawn] element and every icon.
   The ResizeObserver redraws an element whenever its size changes
   (turning a phone sideways, for example). */
function drawAll() {
  document.documentElement.classList.add('drawn-ready');   // tells CSS to hide the plain fallback border
  document.querySelectorAll('[data-drawn]').forEach(draw);
  drawIcons();
}
const resizer = new ResizeObserver(entries => entries.forEach(e => draw(e.target)));
function watchAll() { document.querySelectorAll('[data-drawn]').forEach(el => resizer.observe(el)); }

/* Wait for the fonts (they change element sizes), then draw. */
document.fonts.ready.then(() => { drawAll(); watchAll(); });
