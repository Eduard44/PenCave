/* =====================================================================
   visit.js  (a tiny memory of where the reader has been)
   Remembers two things in the browser's localStorage:
     done  the lessons whose LAST page has been reached
     last  the lesson and page seen most recently (the "bookmark")
   The Contents page uses it for its dots and its "Continue" line.
   This is only a first, simple version. Real progress (points, levels,
   a versioned save file) is built in Step 7 and will replace this.
   Wrapped in try/catch: some browsers refuse storage (private windows),
   and then the site simply forgets, which is harmless.
   ===================================================================== */
const VISIT_KEY = 'pencave-visit';

/* Read the memory. If there is none (or it is damaged), start empty. */
function readVisit() {
  try {
    const v = JSON.parse(localStorage.getItem(VISIT_KEY));
    if (v && v.v === 1 && Array.isArray(v.done)) return v;
  } catch (e) { /* nothing saved, or storage refused */ }
  return { v: 1, done: [], last: null };   // v = the version of this save format
}

/* Call this each time a lesson page is shown. */
function saveVisit(lesson, page, total) {
  const v = readVisit();
  v.last = { lesson: lesson, page: page };
  if (page === total && !v.done.includes(lesson)) v.done.push(lesson);   // reached the last page
  try { localStorage.setItem(VISIT_KEY, JSON.stringify(v)); } catch (e) { /* ignore */ }
}
