/* =====================================================================
   lessons/lesson-1.js  (the DATA for Lesson 1)
   A lesson is data, not code. To add a lesson you copy this file, change
   the words, and point to it from index.html. No other code changes.

   Why a .js file and not .json? A browser will not load .json files when
   you double-click index.html (it only works on a web server). A .js file
   loads either way. We can switch later if it is useful.

   THE SHAPE OF A LESSON
     number      the lesson number
     volume      the volume it belongs to (shown on the first screen only)
     title       the lesson name
     next        the name of the next lesson (shown on the last page)
     pages       a list of pages. Each page has:
        title    the page heading (one idea per page)
        type     optional. Leave out for a steps page. Or one of:
                   'try'      needs  steps: ['...', ...]
                   'turn'     needs  exercises: [{ title, text, easier, harder }]
                   'practice' needs  count, hint, figure: { art, caption }  (the task is the intro)
                   'reflect'  needs  question, boxLabel, lookFirst: { heading, text, caption }
                   'next'     needs  why (the title and intro are yours; the next-lesson button is automatic)
        intro    a few sentences: what we are making and why
        frames   the drawn step frames: { art, caption }   (optional on non-steps pages)
                   art: 1, 2 or 3 (placeholder drawings for now), or 'mistake'
        notes    margin notes: { heading, text }
        marginArt  optional small drawing under the notes ('mistake')
        rest     optional quiet note about the empty space on the page

   EVERYTHING IN [BRACKETS] IS A PLACEHOLDER FOR YOUR OWN WORDS.
   ===================================================================== */
window.PENCAVE_LESSONS = window.PENCAVE_LESSONS || {};

window.PENCAVE_LESSONS[1] = {
  number: 1,
  volume: 'Volume 1 · Foundations',   // shown above the heading on the very first screen
  title: 'Welcome and how to practise',
  next: 'Line work',
  pages: [
    {
      title: "What you need",
      intro: "All you need is a pencil and some plain paper. Any pencil, any paper, whatever you have at home.",
      frames: [
        { art: 'l1-desk-1', caption: "1. Any pencil." },
        { art: 'l1-desk-2', caption: "2. Any plain paper." },
        { art: 'l1-desk-3', caption: "3. Somewhere flat to draw." }
      ],
      notes: [
        { heading: "Nothing to buy", text: "You don't need to buy anything today. If you want better tools later, you'll know what you're missing." },
        { heading: "Watch for", text: "Small scraps of paper. A small page makes you draw small and tight, so use a full sheet." }
      ],
      marginArt: 'l1-scrap',
      rest: "Put your pencil and paper in front of you before you turn the page."
    },
    {
      title: "How to hold the pencil",
      intro: "Hold the pencil loosely and let your arm do the moving, not just your fingers. A tight grip gives tight, shaky lines.",
      frames: [
        { art: 'l1-arm-1', caption: "1. Hold it loosely, don't squeeze." },
        { art: 'l1-arm-2', caption: "2. Let your whole arm move." },
        { art: 'l1-arm-3', caption: "3. The line follows your arm." }
      ],
      notes: [{ heading: "A quick check", text: "If your fingertips go white or your hand starts to ache, you're gripping too hard. Loosen up." }]
    },
    {
      title: "How to practise",
      intro: "Short sessions, done often, beat one long one. Ten minutes is plenty to start with. Repeat the same thing and watch what changes over time.",
      frames: [
        { art: 'l1-days-1', caption: "1. Draw for a short while." },
        { art: 'l1-days-2', caption: "2. Put it away and come back another day." }
      ],
      notes: [{ heading: "No deadline", text: "Real progress takes weeks, not days. Nobody is waiting for you to finish." }]
    },
    {
      type: 'try',                                   // Guided try: draw along on paper
      title: "Warm up a page",
      intro: "Let's fill one page with loose marks. There's no right way to do it. What matters is that your hand feels relaxed.",
      steps: [
        "Put a clean page in front of you and hold the pencil loosely.",
        "Make marks back and forth across the page, moving from your arm. Go quickly if you like. Neatness doesn't matter here.",
        "Keep going until the page is full, then take a moment to look at it."
      ],
      notes: [{ heading: "Keep it", text: "Hold on to your pages. You'll want to compare them later." }]
    },
    {
      type: 'turn',                                  // Your turn: open exercises, alone
      title: "Your turn",
      intro: "Now it's up to you. Pick one, two or all three.",
      exercises: [
        { title: "Set up your drawing spot", text: "Pick a place where you can draw most days. Leave your pencil and paper there, ready to go.", easier: "Use a table you already use and leave one pencil and one sheet on it.", harder: "Choose a time of day for it as well." },
        { title: "Plan five short sessions", text: "Pick five days and how long each will be, for example ten minutes. Write them down.", easier: "Start with two days.", harder: "Make them five days in a row." },
        { title: "Compare a tight and a loose page", text: "Fill one page gripping the pencil tight, then another holding it loosely. Put them side by side and look.", easier: "Fill half a page each.", harder: "Add a third page with a grip in between, and decide which one you like best." }
      ],
      notes: [{ heading: "Your reason", text: "Write one line about why you want to draw, and keep it with your first page." }]
    },
    {
      type: 'practice',                              // Practice: repeat it, counted (not every lesson has one)
      title: "Five warm-up pages",
      intro: "Repeat the warm-up from before: fill a page with loose marks, moving from your arm. Do five pages, all at once or over a few days.",
      count: 5,                                      // how many blank pages to tick off
      hint: "Tick each page as you fill it.",
      figure: { art: 'l1-warmup-page', caption: "A page full of warm-up marks." },
      notes: [{ heading: "Why repeat", text: "Your hand learns by doing the same thing again and again." }]
    },
    {
      type: 'reflect',                               // Reflect: one question + Look first
      title: "What did you notice?",
      intro: "Take a look at your five pages.",
      question: "What did you notice about your hand?",
      lookFirst: { art: 'l1-warmup-page', heading: "Look first", text: "Look at the marks you just made. Find one that looks relaxed and one that looks tight. What's different about them?", caption: "Your own warm-up pages." },
      boxLabel: "What I noticed about my hand"
    },
    {
      type: 'next',                                 // Next: what comes next and why
      title: "You've started",
      intro: "You've set up your space, tried a loose grip and filled five pages.",
      why: "Next is line work. A loose hand is where clean lines begin."
    }
  ]
};
