/* lessons/lesson-2.js: PLACEHOLDER lesson 2 (Line work).
   Same 7 pages as lesson 1, all [YOUR TEXT HERE]. The data format is explained at the top of lesson-1.js.
   Change the words and drawings here; add, remove or reorder pages as the lesson needs. */
window.PENCAVE_LESSONS = window.PENCAVE_LESSONS || {};

window.PENCAVE_LESSONS[2] = {
  number: 2,
  volume: 'Volume 1 · Foundations',   // shown above the heading on the very first screen
  title: 'Line work',
  next: 'Simple shapes',
  pages: [
    {
      title: "One clean stroke",
      intro: "A clean line is one stroke, drawn in one go. It doesn't have to be perfect. It has to be one line, not a hundred little ones.",
      frames: [
        { art: 'l2-hairy', caption: "1. Many tiny strokes make a hairy line." },
        { art: 'l2-clean', caption: "2. One stroke makes a clean line." },
        { art: 'l2-wobble', caption: "3. If it wobbles, leave it. Draw the next one." }
      ],
      notes: [
        { heading: "Draw from the arm", text: "Same as the warm-up. Move from your arm, not your fingers or your wrist." },
        { heading: "Watch for", text: "A line drawn from the wrist. It curves because only the wrist moved. Keep your wrist soft and let your arm travel." }
      ],
      marginArt: 'l2-wrist',
      rest: "Hold your pencil above the page and trace a line in the air before you turn over."
    },
    {
      title: "Straight lines",
      intro: "Start with straight lines. Pick the two ends first, then draw between them.",
      frames: [
        { art: 'l2-dots', caption: "1. Mark a start and an end." },
        { art: 'l2-hover', caption: "2. Hover over the line a few times without touching." },
        { art: 'l2-stroke', caption: "3. Draw it in one stroke." }
      ],
      notes: [{ heading: "Look at the end", text: "Keep your eyes on where the line will end, not on the pencil tip." }]
    },
    {
      title: "Curved lines",
      intro: "Curves work the same way. Mark where it starts and ends, hover over it, then draw it in one stroke.",
      frames: [
        { art: 'l2-curve-hover', caption: "1. Mark a start and an end, and hover over the curve." },
        { art: 'l2-curve', caption: "2. Draw it in one stroke." }
      ],
      notes: [{ heading: "Start wide", text: "Long, wide curves stay smoother than tight ones. Start big." }]
    },
    {
      type: 'try',                                   // Guided try: draw along on paper
      title: "Ten straight, ten curved",
      intro: "Let's fill a page with lines. Ten straight, then ten curved. One stroke each.",
      steps: [
        "Draw ten straight lines, each in one stroke. Mark the start and end first if it helps.",
        "Draw ten curved lines the same way. Hover over each one before you touch down.",
        "Don't go back over any line. When you're done, look at the page."
      ],
      notes: [{ heading: "Leave the wobbles", text: "A wobbly line you leave alone teaches you more than one you fix." }]
    },
    {
      type: 'turn',                                  // Your turn: open exercises, alone
      title: "Your turn",
      intro: "Now it's up to you. Pick one, two or all three.",
      exercises: [
        { title: "Corner to corner", text: "Mark a dot in each corner of a page. Join one dot to another with a single stroke. Do it for every pair.", easier: "Use three dots.", harder: "Add dots along the edges and join those too." },
        { title: "A line the length of the page", text: "Draw one long straight line from one edge of the page to the other, in one stroke. Do it five times, in different places.", easier: "Use half the page.", harder: "Draw it without marking the ends first." },
        { title: "Draw a wave", text: "Draw a long, smooth wave across the page in one stroke. Then draw it again with tighter waves.", easier: "Make the waves big and slow.", harder: "Keep the waves the same height all the way across." }
      ],
      notes: [{ heading: "Count them", text: "Count your lines as you go. The repetition is the practice." }]
    },
    {
      type: 'practice',                              // Practice: repeat it, counted (not every lesson has one)
      title: "Five pages of lines",
      intro: "Fill a page with lines, ten and then ten more, a mix of straight and curved. Do five pages, all at once or over a few days.",
      count: 5,                                      // how many blank pages to tick off
      hint: "Tick each page as you fill it.",
      figure: { art: 'l2-lines-page', caption: "A page of single-stroke lines." },
      notes: [{ heading: "Quantity", text: "Quantity does the work. Each page is another chance to draw a cleaner line." }]
    },
    {
      type: 'reflect',                               // Reflect: one question + Look first
      title: "Look at your lines",
      intro: "Lay your five pages side by side.",
      question: "Which line is cleanest, and what did you do differently?",
      lookFirst: { art: 'l2-lines-page', heading: "Look first", text: "Find the best line across your five pages. What made it work? Where did you look, and how did your arm move?", caption: "Your own five pages." },
      boxLabel: "What I did differently"
    },
    {
      type: 'next',                                 // Next: what comes next and why
      title: "Lines finished",
      intro: "You drew lines in one stroke, straight and curved, from the arm.",
      why: "Next are simple shapes. Triangles, circles and squares are made of the lines you've been practising."
    }
  ]
};
