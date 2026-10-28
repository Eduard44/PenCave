/* =====================================================================
   art.js  (PLACEHOLDER step-frame drawings)
   Draws a small triangle in 1, 2 or 3 steps so the layout can be tested.
   You will replace these with your own drawings later (put the files in
   the art folder). The rule they show is the real one:
     BLUE = the line added in THIS step.   GRAPHITE = earlier lines.
   The new line is also drawn a little THICKER, so the signal is not
   colour alone (blue is faint for some eyes).
   Uses lineD, circleD, grainFilter, tidy, COLORS from draw.js.
   ===================================================================== */
function stepArt(step, seed) {
  if (typeof step === 'string' && step.indexOf('l1-') === 0) return namedArt(step, seed);   // Lesson 1's own drawings (below)
  const G = COLORS.graphite, B = COLORS.blue, R = COLORS.red, t = tidy();
  /* The three sides of the triangle, as [x1, y1, x2, y2] on a 100 by 120 grid. */
  const base = [20, 100, 80, 100], left = [20, 100, 50, 40], right = [50, 40, 80, 100];
  const ghostOp = (0.45 * (1 - t)).toFixed(3);   // the faint second pass

  /* One pencil line. "width" is thicker for new lines. */
  function stroke(l, color, s, width) {
    let o = '<path d="' + lineD(l[0], l[1], l[2], l[3], seed + s, 0.9) + '" stroke="' + color + '" stroke-width="' + width + '" fill="none" stroke-linecap="round"/>';
    if (t < 0.99) o += '<path d="' + lineD(l[0], l[1], l[2], l[3], seed + s + 500, 1.1) + '" stroke="' + color + '" stroke-width="1.2" stroke-opacity="' + ghostOp + '" fill="none" stroke-linecap="round"/>';
    return o;
  }
  const OLD = 2.2, NEW = 3;   // old-line width, new-line width

  let s = '';
  if (step === 1) s += stroke(base, B, 1, NEW);
  if (step === 2) s += stroke(base, G, 1, OLD) + stroke(left, B, 2, NEW);
  if (step === 3) s += stroke(base, G, 1, OLD) + stroke(left, G, 2, OLD) + stroke(right, B, 3, NEW);
  if (step === 'mistake') {
    /* A corner that does not close, with the red correction circle round the gap. */
    s += stroke(base, G, 1, OLD) + stroke(left, G, 2, OLD) + stroke([50, 40, 74, 92], G, 5, OLD);
    s += '<path d="' + circleD(77, 99, 10, seed + 90, 0.6) + '" stroke="' + R + '" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
  }
  const fid = 'sf' + seed + step;
  const f = grainFilter(fid, 100, 120, (seed % 90) + 1);
  return '<svg viewBox="0 0 100 120" role="img" aria-label="Placeholder drawing" preserveAspectRatio="xMidYMid meet"><defs>' + f + '</defs><g' + (f ? ' filter="url(#' + fid + ')"' : '') + '>' + s + '</g></svg>';
}


/* =====================================================================
   NAMED DRAWINGS (Lesson 1)  -  construction style
   A lesson names one of these in its data, for example  art: 'l1-desk-2'.
   They are drawn in code with the same pencil lines as the triangle above, but built
   the way an artist builds a figure: tubes for limbs, balls for joints, wedges for hands,
   thin slabs for paper. Lines may cross, like construction lines do.
   The colour rule still holds:
     BLUE and thicker = what is NEW in this step.   GRAPHITE = earlier lines.
     Earlier positions of a moving thing stay on the page, but fainter ("ghosts").
   The faint second pass and the pencil grain follow the tidiness level, like the triangle.
   Every drawing has a real description for screen readers (L1_ALT).
   Same size as the triangle: a 100 by 120 grid.
   ===================================================================== */
const L1_ALT = {
  'l1-desk-1': 'A pencil.',
  'l1-desk-2': 'A pencil on a table, and a sheet of paper behind it.',
  'l1-desk-3': 'A pencil and a sheet of paper lying on a table.',
  'l1-arm-1': 'An arm drawn as tubes and joints, holding a pencil to the paper.',
  'l1-arm-2': 'The same arm in a new position, with the first position faint behind it and arrows showing the whole arm swinging from the shoulder.',
  'l1-arm-3': 'The arm in a third position, with the earlier ones faint, and one long line drawn on the paper.',
  'l1-days-1': 'One sheet of paper with a few quick lines on it: a short session.',
  'l1-days-2': 'Two marked sheets with an empty one between them: coming back another day.',
  'l1-warmup-page': 'A sheet of paper filled with loose back-and-forth marks.',
  'l1-scrap': 'A small scrap of paper with tight little marks, circled in red.'
};

function namedArt(key, seed) {
  const G = COLORS.graphite, B = COLORS.blue, R = COLORS.red, t = tidy();
  const OLD = 1.8, NEW = 2.4, THIN = 1.2, GHOST = 0.35;     // line widths, and how faint a ghost is
  const ghostOp = (0.45 * (1 - t)).toFixed(3);
  let n = 0;

  /* ---- small vector helpers (a point is [x, y]) ---- */
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
  const len = a => Math.hypot(a[0], a[1]), unit = a => mul(a, 1 / (len(a) || 1)), perp = a => [-a[1], a[0]];

  /* ---- drawing: every function returns SVG text. "o" = { c: colour, w: width, op: opacity } ---- */
  function line(a, b, o, amp) {
    n++;
    const k = amp == null ? 0.7 : amp;
    const op = o.op == null ? 1 : o.op;
    let r = '<path d="' + lineD(a[0], a[1], b[0], b[1], seed + n, k) + '" stroke="' + o.c + '" stroke-width="' + o.w + '" stroke-opacity="' + op + '" fill="none" stroke-linecap="round"/>';
    if (t < 0.99) r += '<path d="' + lineD(a[0], a[1], b[0], b[1], seed + n + 500, k * 1.2) + '" stroke="' + o.c + '" stroke-width="1" stroke-opacity="' + (ghostOp * op).toFixed(3) + '" fill="none" stroke-linecap="round"/>';
    return r;
  }
  /* A curve through points, with a little hand wobble. */
  function curve(pts, o, amp) {
    n++;
    const rand = makeRandom(seed + n), k = amp == null ? 0.35 : amp;
    const jittered = pts.map((p, i) => (i === 0 || i === pts.length - 1) ? p : [p[0] + (rand() - 0.5) * 2 * k, p[1] + (rand() - 0.5) * 2 * k]);
    const op = o.op == null ? 1 : o.op;
    return '<path d="' + smooth(jittered) + '" stroke="' + o.c + '" stroke-width="' + o.w + '" stroke-opacity="' + op + '" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  /* Part of an ellipse: centre c, half-widths rx and ry, tilted by rot, from angle a0 to a1. */
  function ellipse(c, rx, ry, rot, a0, a1, o) {
    const pts = [], steps = 14;
    for (let i = 0; i <= steps; i++) {
      const a = a0 + (a1 - a0) * i / steps, x = rx * Math.cos(a), y = ry * Math.sin(a);
      pts.push([c[0] + x * Math.cos(rot) - y * Math.sin(rot), c[1] + x * Math.sin(rot) + y * Math.cos(rot)]);
    }
    return curve(pts, o);
  }
  /* A box side drawn the way a hand draws it: the line runs a little PAST both corners and bows
     very slightly, instead of stopping dead and staying ruler-straight. Used for sheets, the table
     and the hand. (The tubes and the pencil keep their straighter lines.) */
  function sketch(a, b, o) {
    n++;
    const rand = makeRandom(seed + n), d = sub(b, a), L = len(d), u = unit(d), nn = perp(u);
    const over = Math.min(2.6, L * 0.07), bow = (rand() - 0.5) * 2 * Math.min(1.2, L * 0.03);
    const A = sub(a, mul(u, over * (0.6 + rand() * 0.8))), Bp = add(b, mul(u, over * (0.6 + rand() * 0.8)));
    const mid = add(mul(add(A, Bp), 0.5), mul(nn, bow));
    const op = o.op == null ? 1 : o.op;
    let r = curve([A, mid, Bp], o, 0.12);
    if (t < 0.99) {                                          // the faint second pass, a little off
      const mid2 = add(mid, mul(nn, (rand() - 0.5) * 1.4));
      r += '<path d="' + smooth([sub(A, mul(u, 0.6)), mid2, add(Bp, mul(u, 0.4))]) + '" stroke="' + o.c + '" stroke-width="1" stroke-opacity="' + (ghostOp * op).toFixed(3) + '" fill="none" stroke-linecap="round"/>';
    }
    return r;
  }
  const polygon = (pts, o) => pts.map((p, i) => sketch(p, pts[(i + 1) % pts.length], o)).join('');

  /* A ball (a joint): a circle, plus the front half of an ellipse across it so it reads as round. */
  function ball(c, r, o, tilt) {
    n++;
    return '<path d="' + circleD(c[0], c[1], r, seed + n, 0.35) + '" stroke="' + o.c + '" stroke-width="' + o.w + '" stroke-opacity="' + (o.op == null ? 1 : o.op) + '" fill="none" stroke-linecap="round"/>' +
           ellipse(c, r, r * 0.38, tilt || 0, 0, Math.PI, o);
  }
  /* A tube from A to B, with radius r1 at A and r2 at B: two side lines and an arc across each end. */
  function tube(A, B, r1, r2, o) {
    const u = unit(sub(B, A)), nn = perp(u), ang = Math.atan2(u[1], u[0]) + Math.PI / 2;
    return line(add(A, mul(nn, r1)), add(B, mul(nn, r2)), o) + line(sub(A, mul(nn, r1)), sub(B, mul(nn, r2)), o) +
           ellipse(A, r1, r1 * 0.4, ang, 0, Math.PI, o) + ellipse(B, r2, r2 * 0.4, ang, 0, Math.PI, o);
  }
  /* A pencil from its blunt end A to its point T: body, two bands near the blunt end, a cone, and a dark point. */
  function pencil(A, T, r, o) {
    const u = unit(sub(T, A)), nn = perp(u), L = len(sub(T, A)), ang = Math.atan2(u[1], u[0]) + Math.PI / 2;
    const P = sub(T, mul(u, Math.min(7, L * 0.2))), tipStart = sub(T, mul(u, Math.min(2.4, L * 0.07)));
    let out = line(add(A, mul(nn, r)), add(P, mul(nn, r)), o) + line(sub(A, mul(nn, r)), sub(P, mul(nn, r)), o) +
              ellipse(A, r, r * 0.4, ang, 0, Math.PI, o) +
              ellipse(add(A, mul(u, L * 0.13)), r, r * 0.4, ang, 0, Math.PI, o) + ellipse(add(A, mul(u, L * 0.2)), r, r * 0.4, ang, 0, Math.PI, o) +
              ellipse(P, r, r * 0.4, ang, 0, Math.PI, o) +
              line(add(P, mul(nn, r)), T, o) + line(sub(P, mul(nn, r)), T, o);
    out += line(add(tipStart, mul(nn, r * 0.35)), sub(tipStart, mul(nn, r * 0.35)), o);   // where the wood ends and the lead starts
    return out;
  }
  /* A flat sheet seen at a slant: four corners (far-left, far-right, near-right, near-left) and a thin edge along the front. */
  function sheet(c, o, thick) {
    const k = thick == null ? 2 : thick;
    return polygon(c, o) + line(c[3], [c[3][0], c[3][1] + k], o) + line(c[2], [c[2][0], c[2][1] + k], o) + line([c[3][0], c[3][1] + k], [c[2][0], c[2][1] + k], o);
  }
  /* Quick loose marks on a sheet: "count" lines across, between corners of the sheet. */
  function marks(c, count, o) {
    let r = '';
    for (let i = 0; i < count; i++) {
      const f = (i + 1) / (count + 1);
      const a = add(c[0], mul(sub(c[3], c[0]), f)), b = add(c[1], mul(sub(c[2], c[1]), f));
      r += line(add(a, mul(sub(b, a), 0.12)), sub(b, mul(sub(b, a), 0.12)), o, 1);
    }
    return r;
  }
  /* An arrowhead at point P, pointing along the angle "a". */
  function head(P, a, o) {
    const k = 4.5, s = 0.5;
    return line(P, [P[0] - Math.cos(a - s) * k, P[1] - Math.sin(a - s) * k], o, 0.05) + line(P, [P[0] - Math.cos(a + s) * k, P[1] - Math.sin(a + s) * k], o, 0.05);
  }
  function arrow(A, B, o) { return line(A, B, o, 0.3) + head(B, Math.atan2(B[1] - A[1], B[0] - A[0]), o); }
  function arcArrow(c, r, a1, a2, o) {
    const pts = [], steps = 9;
    for (let i = 0; i <= steps; i++) { const a = a1 + (a2 - a1) * i / steps; pts.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]); }
    return curve(pts, o, 0.05) + head(pts[steps], Math.atan2(pts[steps][1] - pts[steps - 1][1], pts[steps][0] - pts[steps - 1][0]), o);
  }

  /* ---- the desk: a table slab, a sheet of paper on it, a pencil lying in front ---- */
  const tableTop = [[16, 20], [84, 20], [100, 86], [0, 86]];
  const deskPaper = [[30, 28], [68, 24], [80, 60], [24, 64]];
  const deskPencilA = [12, 74], deskPencilT = [90, 79];
  const table = o => polygon(tableTop, o) + line([0, 86], [0, 96], o) + line([100, 86], [100, 96], o) + line([0, 96], [100, 96], o);

  /* ---- the arm: side view, drawing at a desk ----
     Shoulder S, elbow E, wrist W, pencil point T on the paper. The pencil leans at a fixed angle;
     the elbow is worked out from the two arm bones so the arm bends the way a real one does. */
  const S = [28, 26], BONE = 40, DP = unit([0.38, 0.925]);
  const wrist = T => sub(T, mul(DP, 28));
  function elbow(T) {
    const W = wrist(T), dx = W[0] - S[0], dy = W[1] - S[1], d = Math.min(Math.hypot(dx, dy), BONE * 2 - 0.5);
    const a = d / 2, h = Math.sqrt(Math.max(0, BONE * BONE - a * a)), dd = Math.hypot(dx, dy);
    return [S[0] + dx / 2 + (-dy) / dd * h, S[1] + dy / 2 + dx / dd * h];
  }
  function arm(T, o, withShoulder) {
    const E = elbow(T), W = wrist(T), H = add(W, mul(DP, 12)), nn = perp(DP);
    let r = '';
    if (withShoulder) r += ball(S, 6, o);
    r += tube(S, E, 5, 4.2, o) + ball(E, 4.8, o) + tube(E, W, 4.2, 3.2, o);
    r += polygon([add(W, mul(nn, 4.4)), add(H, mul(nn, 2.8)), sub(H, mul(nn, 2.8)), sub(W, mul(nn, 4.4))], o);   // the hand, a wedge
    r += pencil(sub(T, mul(DP, 38)), T, 2, o);
    return r;
  }
  const T1 = [44, 100], T2 = [66, 100], T3 = [88, 100];
  const upperAngle = T => { const E = elbow(T); return Math.atan2(E[1] - S[1], E[0] - S[0]); };
  const armPaper = o => polygon([[6, 97], [94, 97], [100, 110], [0, 110]], o);

  const blue = { c: B, w: NEW }, oldG = { c: G, w: OLD }, thin = { c: G, w: THIN }, ghost = { c: G, w: THIN, op: GHOST };
  const arrowBlue = { c: B, w: 1.8 };

  /* ---- three sheets in a row, for the "short session, then another day" page ---- */
  const sh = x => [[x, 34], [x + 26, 30], [x + 27, 92], [x + 1, 98]];

  let body = '';
  switch (key) {
    case 'l1-desk-1': body = pencil(deskPencilA, deskPencilT, 3.4, blue); break;
    case 'l1-desk-2': body = sheet(deskPaper, blue) + pencil(deskPencilA, deskPencilT, 3.4, oldG); break;
    case 'l1-desk-3': body = table(blue) + sheet(deskPaper, oldG) + pencil(deskPencilA, deskPencilT, 3.4, oldG); break;

    case 'l1-arm-1': body = armPaper(thin) + arm(T1, blue, true); break;
    case 'l1-arm-2':
      body = armPaper(thin) + arm(T1, ghost, false) + arm(T2, blue, true) +
             arcArrow(S, 24, upperAngle(T1), upperAngle(T2), arrowBlue) +
             arrow([T1[0], 116], [T2[0], 116], arrowBlue);
      break;
    case 'l1-arm-3':
      body = armPaper(thin) + arm(T1, ghost, false) + arm(T2, ghost, false) + arm(T3, oldG, true) +
             line([T1[0], 100], [T3[0], 100], { c: B, w: NEW + 0.6 }, 0.4) +
             arcArrow(S, 24, upperAngle(T1), upperAngle(T3), arrowBlue) +
             arrow([T1[0], 116], [T3[0], 116], arrowBlue);
      break;

    case 'l1-days-1': body = sheet(sh(36), blue) + marks(sh(36), 6, blue); break;
    case 'l1-days-2':
      body = sheet(sh(4), oldG) + marks(sh(4), 6, thin) +
             sheet(sh(36), ghost) +
             sheet(sh(68), blue) + marks(sh(68), 6, blue);
      break;

    case 'l1-warmup-page': {
      const pg = [[26, 14], [74, 10], [78, 104], [22, 108]];
      body = sheet(pg, oldG);
      for (let i = 0; i < 8; i++) {                      // loose back-and-forth marks, from the arm
        const f = (i + 1) / 9, up = i % 2 ? 5 : -5;
        const a = add(pg[0], mul(sub(pg[3], pg[0]), f)), b = add(pg[1], mul(sub(pg[2], pg[1]), f));
        body += line(add(add(a, mul(sub(b, a), 0.1)), [0, up]), sub(sub(b, mul(sub(b, a), 0.1)), [0, up]), thin, 1.4);
      }
      break;
    }
    case 'l1-scrap':
      body = sheet([[16, 12], [84, 8], [88, 104], [12, 108]], ghost) + sheet([[38, 52], [62, 50], [63, 74], [39, 76]], oldG) +
             marks([[38, 52], [62, 50], [63, 74], [39, 76]], 3, thin) +
             ellipse([50, 63], 21, 20, 0, 0, Math.PI * 2.08, { c: R, w: 1.6 });
      break;
    default: body = polygon([[20, 30], [80, 30], [80, 90], [20, 90]], oldG);
  }

  const fid = 'sf' + seed + key;
  const f = grainFilter(fid, 100, 120, (seed % 90) + 1);
  return '<svg viewBox="0 0 100 120" role="img" aria-label="' + (L1_ALT[key] || 'A drawing') + '" preserveAspectRatio="xMidYMid meet"><defs>' + f + '</defs><g' + (f ? ' filter="url(#' + fid + ')"' : '') + '>' + body + '</g></svg>';
}
