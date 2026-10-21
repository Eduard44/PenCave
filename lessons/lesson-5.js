/* lessons/lesson-5.js: PLACEHOLDER lesson 5 (A first look at light).
   Same 7 pages as lesson 1, all [YOUR TEXT HERE]. The data format is explained at the top of lesson-1.js.
   Change the words and drawings here; add, remove or reorder pages as the lesson needs. */
window.PENCAVE_LESSONS = window.PENCAVE_LESSONS || {};

window.PENCAVE_LESSONS[5] = {
  number: 5,
  volume: 'Volume 1 · Foundations',   // shown above the heading on the very first screen
  title: 'A first look at light',
  next: 'A small still life',
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
      type: 'practice',                              // Practice: repeat it, counted (not every lesson has one)
      title: '[YOUR TEXT HERE: Practice heading]',
      intro: '[YOUR TEXT HERE: the task in a few lines. Name the repetition, for example draw ten lines, then ten more.]',
      count: 5,                                      // how many blank pages to tick off
      hint: '[YOUR TEXT HERE: a short line, for example tick each page as you fill it.]',
      figure: { art: 3, caption: '[YOUR TEXT HERE: what a full page looks like]' },
      notes: [{ heading: '[Margin note heading]', text: '[YOUR TEXT HERE]' }]
    },
    {
      type: 'reflect',                               // Reflect: one question + Look first
      title: '[YOUR TEXT HERE: Reflect heading]',
      intro: '[YOUR TEXT HERE]',
      question: '[YOUR TEXT HERE: one short question]',
      lookFirst: { heading: '[Look first]', text: '[YOUR TEXT HERE: study a real object or drawing and name why it works.]', caption: '[YOUR TEXT HERE: what to look at]' },
      boxLabel: '[YOUR TEXT HERE: label for the answer box]'
    },
    {
      type: 'next',                                 // Next: what comes next and why
      title: '[YOUR TEXT HERE: Next page heading, for example Line work finished]',
      intro: '[YOUR TEXT HERE: a line or two on what you did in this lesson.]',
      why: '[YOUR TEXT HERE: why the next lesson follows from this one.]'
    }
  ]
};
