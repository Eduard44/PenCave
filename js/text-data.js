/* =====================================================================
   text-data.js  (THE WORDS of the About and Privacy pages)
   This is the one file you edit to write those two pages. The layout code is in
   text-pages.js and never needs to change when you change a word here.

   THE SHAPE OF A PAGE
     title     the page name (also the heading and the browser tab)
     short     the "In short" box in the margin: two or three sentences
     updated   the "Last updated" date, typed by you, for example '24 Oct 2026'
     sections  a list. Each section has:
        heading   the section heading
        text      the words. A blank line starts a new paragraph.
        later     optional. true draws the section as a dashed grey box, for things still
                  to decide or write. Take the line out when the section is final.
        action    optional (Privacy only): 'download' adds the "Download my notes" link,
                  'erase' adds the "Erase everything on this device" button.
        link      optional: { title, url } adds one link under the words. It opens in a new tab.

   Every [YOUR TEXT HERE ...] is a placeholder: the owner writes and proofreads all words.
   ===================================================================== */
window.PENCAVE_TEXT = {

  /* The welcome-back strip, shown after about 30 days away (welcome-back.js). Two short lines
     and the words on its two buttons. */
  welcomeBack: {
    line1: 'Good to see you come back.',
    line2: "Let's make a comeback with some of the basics. Or do you want to continue from last time?",
    volumeButton: 'Brush up on the basics',
    continueButton: 'Carry on'
  },


  about: {
    title: 'About PenCave',
    updated: '25 Oct 2026',
    short: "PenCave is a free place to learn to draw, made for absolute beginners. It is a book you flip through in order, and you draw on paper. Real progress takes weeks, and there is no deadline.",
    sections: [
      { heading: "Why PenCave exists", text: "PenCave teaches drawing through consistency and repetition. I believe you can learn almost anything with will and repetition, as long as the repetition has a direction.\n\nTo make that easier to stick with, PenCave has points and levels, a notes journal and a calendar, so you can see your own progress. There are a few other learning methods too, so you can pick what helps you most. In the end, only you can keep yourself going.\n\nNothing you do here is collected. It all stays on your device, and I say so all over the site because too many websites take your data and sell it. I want no part in that. This website is for you." },
      { heading: "How the book works", text: "PenCave is a book. Each lesson is a few pages, and the contents page is the only menu. You can choose where to start, but each skill builds on the one before, and every page says what came before and what comes next, so no lesson stands alone.\n\nEvery lesson follows the same rhythm: what we are making and why, then step frames (new lines show in a different pencil colour), a guided try, Your turn, a short Reflect question, and what comes next.\n\nYour turn gives you two or three open exercises to do on your own. They are there so you are not only copying the teacher and then feeling lost.\n\nDraw with pencil and paper, at home. The screen is for reading and following along." },
      { heading: "What to expect", text: "Real progress takes weeks or months, and there is no deadline. Drawing the same thing many times is the method, so PenCave counts repetition and treats it as effort, not talent. Mistakes are normal, and the lessons show them plainly.\n\nLessons are never locked. You earn points for finishing lessons, trying the exercises, writing notes and coming back, and points are never taken away, however long you are away. Levels unlock extra tools: the Timer first, then the Pomodoro, with more to come." },
      { heading: "Who makes PenCave?", text: "PenCave is made by Eduard." },
      { heading: "Inspired by DrawlikeaSir", text: "PenCave was inspired by the roadmap video from DrawlikeaSir on YouTube. The lessons, words and drawings here are our own.", link: { title: "DrawlikeaSir on YouTube", url: "https://www.youtube.com/@DrawlikeaSir" } }
    ]
  },

  privacy: {
    title: 'Privacy',
    updated: '25 Oct 2026',
    short: "PenCave keeps your progress, notes and settings in your own browser, on your own device. It collects nothing: no accounts, no sign-in, no tracking. The website host, GitHub, does log a visitor's IP address when a page loads. That log belongs to GitHub, not to PenCave.",
    sections: [
      { heading: "What stays on your device", text: "Your progress, points, finished lessons, notes, calendar marks, Timer and Pomodoro settings, and your own sound if you add one are kept in this browser, on this device. They are saved in the browser's own storage. PenCave does not send them anywhere and does not set cookies.\n\nBecause they live only in this browser, they stay until you erase them or clear your browser's site data. If you clear your history and site data, or open PenCave in a different browser or on a different device, it starts fresh. A save file (see below) is how you bring your progress with you." },
      { heading: "What we do not collect", text: "PenCave does not collect your name, email address, location or anything you write. There are no accounts, no sign-in, no ads and no analytics or tracking tools. Your notes are never sent to PenCave or to anyone else.\n\nThe Sources links on the Learning methods pages go to other websites. They open only when you click one, and those websites have their own privacy rules." },
      { heading: "Backups and a new device", text: "On the Your progress page you can download a save file. Your browser makes it and saves it like any other download. It does not go to PenCave. You get two files: a .json file you can load back into PenCave on another device or after clearing your browser, and a .txt file you can read yourself.\n\nLoading a save file also happens in your browser. PenCave reads the file on your device and nothing is uploaded. If you already have progress, PenCave asks before it replaces anything.\n\nYour own sound is not in the save file, so add it again on the new device. The .txt file holds your notes as plain text, so keep it somewhere safe.", action: 'download' },
      { heading: "Erase everything on this device", text: "The Erase button removes everything PenCave has kept in this browser: progress, points, notes, calendar marks, Timer and Pomodoro settings, and your own sound. It cannot be undone. PenCave asks you first and offers to download your notes before anything is deleted. Save files you already downloaded are not touched; they are on your device and yours to keep or delete. After erasing, PenCave looks like a first visit.", action: 'erase' },
      { heading: "What the website host logs", text: "PenCave is hosted on GitHub Pages. GitHub's documentation says that when a GitHub Pages site is visited, the visitor's IP address is logged and stored for security purposes, whether or not the visitor is signed in to GitHub. GitHub's general privacy statement describes what else it may log when people use its websites, such as the referring site, the date and time, and device information. It does not give a time limit for how long this is kept for people who only visit a site.\n\nThis happens when any page of PenCave loads, as on any website. It is GitHub's log. PenCave does not add anything to it and does not use it. If PenCave ever moves to a different host, this section will be updated." },
      { heading: "Questions about your data", text: "PenCave holds no data about you, so there is nothing on its side to look up, correct or delete. What PenCave has kept is in your own browser: you can see it on the Your progress page, download it, or erase it, as described above. For anything GitHub holds, such as the visitor log, you would need to ask GitHub. See its privacy statement under Sources." }
    ],
    /* Optional list of sources, shown as a "Sources" block under the sections (same look as on the
       Learning methods pages). Each one is { title, url }. The links open in a new tab. */
    sources: [
      { title: 'GitHub Docs: What is GitHub Pages (see "Data collection")', url: 'https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages' },
      { title: 'GitHub General Privacy Statement', url: 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement' }
    ]
  }
};
