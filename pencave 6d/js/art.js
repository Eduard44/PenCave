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
