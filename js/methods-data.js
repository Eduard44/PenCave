/* =====================================================================
   methods-data.js  (THE WORDS of the Learning methods pages)
   One entry per method. The layout code is in methods.js and never needs to change when you
   change a word here.

   WHO WROTE THESE: the words were drafted from the sources listed on each entry, which were
   read on the "updated" date. Every claim below is one the source says. Where a source is about
   something other than drawing, the page says so. Re-read and re-word anything you like.

   THE SHAPE OF AN ENTRY
     slug      the web address part:  #methods/timed-drills
     title     the method's name (heading, list and browser tab)
     line      the one line shown on the list page
     short     the "In short" box in the margin
     updated   the "Last updated" date
     sections  a list of { heading, text }. A blank line in text starts a new paragraph.
     tool      the PenCave tool that goes with it, or leave it out for none:
                 name     the tool's name
                 href     where it lives, e.g. '#timer'
                 level    the level that unlocks it
                 points   the points for that level
                 ready    a function that says if it is unlocked right now
                 built    false = the tool is not made yet (only its page to read exists)
     sources   a list of { title, url } shown at the bottom of the page
   ===================================================================== */
window.PENCAVE_METHODS = [

  {
    slug: 'timed-drills',
    title: 'Timed drills',
    line: 'Draw for a set time, then stop.',
    short: 'Pick a time, draw until it ends, then put the pencil down. A time limit keeps you moving and stops you fussing over small details.',
    updated: '24 Oct 2026',
    sections: [
      { heading: 'How it works',
        text: 'Choose a time, for example one, five or ten minutes. Start the clock and draw until it ends. When it does, stop, even if the drawing feels unfinished. Look at what you made, then set the next one.' },
      { heading: 'Why artists do it',
        text: 'Gesture drawing is quick sketching against the clock, and artists have long used it to warm up and to train the hand to draw what the eye has already seen. The time limit is the point. With only a short time you have to take in the whole subject first and decide which details matter, so the drawing does not end up stiff or out of proportion.\n\nDifferent limits ask for different things. A short one pushes you to be loose and fast. A longer one leaves room for more care. The sources below describe times from a few seconds up to a few minutes per sketch, and suggest trying several.' },
      { heading: 'What the sources do not say',
        text: 'These sources are about gesture and figure drawing. PenCave borrows the idea of drilling against the clock and uses it for lines and shapes. The sources do not test that exact use, so treat it as a reasonable way to practise, not a proven one.' }
    ],
    tool: { name: 'Timer', href: '#timer', level: 2, points: 30, ready: () => timerUnlocked(), built: true },
    sources: [
      { title: 'Gesture drawing (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Gesture_drawing' },
      { title: 'Gesture drawing guide (MasterClass)', url: 'https://www.masterclass.com/articles/gesture-drawing-guide' }
    ]
  },

  {
    slug: 'pomodoro',
    title: 'Pomodoro',
    line: 'Focus for a set time, then a short break.',
    short: 'Work in focused rounds with short breaks between them. The classic round is 25 minutes, and after four rounds you take a longer break.',
    updated: '24 Oct 2026',
    sections: [
      { heading: 'How it works',
        text: 'Francesco Cirillo came up with it in the late 1980s as a university student. The name is Italian for tomato, after the tomato-shaped kitchen timer he used.\n\nThe steps: decide on one task. Set the timer, typically for 25 minutes, and work until it rings. Take a short break, typically 5 to 10 minutes. After four rounds, take a longer break, typically 20 to 30 minutes, then start again.' },
      { heading: 'PenCave’s starting numbers',
        text: 'PenCave starts with 25 minutes of focus, a 5 minute break, a 20 minute long break and 4 rounds. 20 minutes is the short end of the usual 20 to 30 minutes, and every number can be changed to suit you.' },
      { heading: 'What the research says',
        text: 'One 2023 study at a Dutch university compared students who took their own breaks with students who took planned breaks. The students who chose their own breaks studied for longer stretches and reported more tiredness and distraction, and less concentration and motivation. The groups did not differ in mental effort or in finishing the task.\n\nThat study was about students studying, with a small number of people, and it was not about drawing. It suggests planned breaks can help, not that they are needed.' }
    ],
    tool: { name: 'Pomodoro', href: '#pomodoro', level: 3, points: 80, ready: () => pomoUnlocked(), built: true },
    sources: [
      { title: 'Pomodoro Technique (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Pomodoro_Technique' },
      { title: 'Understanding effort regulation: Comparing “Pomodoro” breaks and self-regulated breaks (British Journal of Educational Psychology, 2023)', url: 'https://pubmed.ncbi.nlm.nih.gov/36859717/' }
    ]
  },

  {
    slug: 'spaced-practice',
    title: 'Spaced practice',
    line: 'Short sessions on different days.',
    short: 'Several shorter sessions spread over days tend to work better than one long session.',
    updated: '24 Oct 2026',
    sections: [
      { heading: 'How it works',
        text: 'Instead of one long sitting, split your practice into shorter sessions on different days, for example 15 minutes on Monday, Wednesday and Friday. Each time, start by looking at what you drew last time.' },
      { heading: 'What the research says',
        text: 'Researchers call it the spacing effect. A review of 317 experiments in 184 articles found that spreading study out beat doing it in one block, even when the total time was the same. It also found that the best gap between sessions depends on how long you need to remember: the longer you want to keep something, the longer the gap can be.' },
      { heading: 'What the research does not say',
        text: 'Those experiments were mostly about memorising words and lists, not about drawing. Drawing is a physical skill as well as a memory one. Spacing is a sensible way to practise, but the research does not show it for drawing.' }
    ],
    tool: null,
    sources: [
      { title: 'Distributed practice in verbal recall tasks: A review and quantitative synthesis (Cepeda and others, 2006)', url: 'https://digitalcommons.usf.edu/psy_facpub/1771/' }
    ]
  },

  {
    slug: 'daily-warm-up',
    title: 'Daily warm-up',
    line: 'A short routine to start each day.',
    short: 'A few minutes of easy drawing before the real session, to loosen your hand and get started.',
    updated: '24 Oct 2026',
    sections: [
      { heading: 'How it works',
        text: 'Start each session with a few minutes of simple drawing before you begin the main work. Common warm-ups are straight lines in several directions, drawn with the whole arm, circles and ovals turned from the shoulder, rows of evenly spaced hatching lines, and quick loose sketches.' },
      { heading: 'Why artists do it',
        text: 'One artist’s guide says a warm-up readies your hands, arms and mind, and matters most before a long session or after a break from drawing. It also says that practising lines and circles can build muscle memory. Gesture drawing is often used as a warm-up before longer figure drawing too.' },
      { heading: 'What the sources do not say',
        text: 'These are teaching guides written by artists, not experiments. They describe what many artists find useful.' },
      { heading: 'In PenCave',
        text: 'A daily warm-up generator is planned for Level 4 (150 points) and is not made yet. Until then, the line and shape lessons work well as a warm-up.' }
    ],
    tool: { name: 'Daily warm-up', href: null, level: 4, points: 150, ready: () => false, built: false },
    sources: [
      { title: 'Five Warm Up Exercises to Improve Your Art (Clip Studio Tips)', url: 'https://tips.clip-studio.com/en-us/articles/7540' },
      { title: 'Gesture drawing (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Gesture_drawing' }
    ]
  }
];
