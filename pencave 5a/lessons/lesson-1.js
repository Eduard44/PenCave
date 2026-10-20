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
                   'reflect'  needs  question, lookFirst: { heading, text }, boxLabel
                   'next'     needs nothing extra (just title and intro)
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
      title: '[YOUR TEXT HERE: page 1 heading]',
      intro: '[YOUR TEXT HERE: two or three sentences. What we are making and why.]',
      frames: [
        { art: 1, caption: '1. [YOUR TEXT HERE]' },
        { art: 2, caption: '2. [YOUR TEXT HERE]' },
        { art: 3, caption: '3. [YOUR TEXT HERE]' }
      ],
      notes: [
        { heading: '[Margin note heading]', text: '[YOUR TEXT HERE]' },
        { heading: '[Watch for]', text: '[YOUR TEXT HERE]' }
      ],
      marginArt: 'mistake',
      rest: '[YOUR TEXT HERE: optional. Delete this line if the page needs no rest note.]'
    },
    {
      title: '[YOUR TEXT HERE: page 2 heading]',
      intro: '[YOUR TEXT HERE]',
      frames: [
        { art: 1, caption: '1. [YOUR TEXT HERE]' },
        { art: 2, caption: '2. [YOUR TEXT HERE]' },
        { art: 3, caption: '3. [YOUR TEXT HERE]' }
      ],
      notes: [{ heading: '[Margin note heading]', text: '[YOUR TEXT HERE]' }]
    },
    {
      title: '[YOUR TEXT HERE: page 3 heading]',
      intro: '[YOUR TEXT HERE]',
      frames: [
        { art: 1, caption: '1. [YOUR TEXT HERE]' },
        { art: 2, caption: '2. [YOUR TEXT HERE]' }
      ],
      notes: [{ heading: '[Margin note heading]', text: '[YOUR TEXT HERE]' }]
    },
    {
      type: 'try',                                   // Guided try: draw along on paper
      title: '[YOUR TEXT HERE: Guided try heading]',
      intro: '[YOUR TEXT HERE: what we are about to draw together.]',
      steps: [
        '[YOUR TEXT HERE: step 1]',
        '[YOUR TEXT HERE: step 2]',
        '[YOUR TEXT HERE: step 3]'
      ],
      notes: [{ heading: '[Margin note heading]', text: '[YOUR TEXT HERE]' }]
    },
    {
      type: 'turn',                                  // Your turn: open exercises, alone
      title: '[YOUR TEXT HERE: Your turn heading]',
      intro: '[YOUR TEXT HERE: now you choose. Two or three open exercises.]',
      exercises: [
        { title: '[Exercise 1 name]', text: '[YOUR TEXT HERE]', easier: '[YOUR TEXT HERE]', harder: '[YOUR TEXT HERE]' },
        { title: '[Exercise 2 name]', text: '[YOUR TEXT HERE]', easier: '[YOUR TEXT HERE]', harder: '[YOUR TEXT HERE]' },
        { title: '[Exercise 3 name]', text: '[YOUR TEXT HERE]', easier: '[YOUR TEXT HERE]', harder: '[YOUR TEXT HERE]' }
      ],
      notes: [{ heading: '[Margin note heading]', text: '[YOUR TEXT HERE]' }]
    },
    {
      type: 'reflect',                               // Reflect: one question + Look first
      title: '[YOUR TEXT HERE: Reflect heading]',
      intro: '[YOUR TEXT HERE]',
      question: '[YOUR TEXT HERE: one short question]',
      lookFirst: { heading: '[Look first]', text: '[YOUR TEXT HERE: study a real object or drawing and name why it works.]' },
      boxLabel: '[YOUR TEXT HERE: label for the answer box]'
    },
    {
      type: 'next',                                 // Next: what comes next and why
      title: '[YOUR TEXT HERE: Next heading]',
      intro: '[YOUR TEXT HERE: what comes next and why it builds on this lesson.]'
    }
  ]
};
