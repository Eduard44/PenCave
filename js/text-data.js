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

   Every [YOUR TEXT HERE ...] is a placeholder: the owner writes and proofreads all words.
   ===================================================================== */
window.PENCAVE_TEXT = {

  about: {
    title: 'About PenCave',
    updated: '[YOUR DATE HERE: for example 24 Oct 2026]',
    short: '[YOUR TEXT HERE: In short. Two or three sentences that sum up PenCave.]',
    sections: [
      { heading: 'Why PenCave exists',    text: '[YOUR TEXT HERE: why you made PenCave.]' },
      { heading: 'How the book works',    text: '[YOUR TEXT HERE: the book, lessons, pages, Your turn, and the order to take them in.]' },
      { heading: 'What to expect',        text: '[YOUR TEXT HERE: real progress takes weeks, there is no deadline, nothing is locked in the lessons.]' },
      { heading: 'Who makes PenCave?',    text: '[YOUR TEXT HERE: a name, or thanks to helpers. To decide.]', later: true },
      { heading: 'Credit for the roadmap video', text: '[YOUR TEXT HERE: maybe a thank-you and a link to the video or channel. To decide.]', later: true }
    ]
  },

  privacy: {
    title: 'Privacy',
    updated: '[YOUR DATE HERE: for example 24 Oct 2026]',
    short: '[YOUR TEXT HERE: In short. What PenCave keeps, where, and what it does not collect.]',
    sections: [
      { heading: 'What stays on your device',      text: '[YOUR TEXT HERE: progress, notes, Timer settings and your own sound are kept only in this browser.]' },
      { heading: 'What we do not collect',         text: '[YOUR TEXT HERE: what PenCave does not collect or hold.]' },
      { heading: 'Backups and a new device',       text: '[YOUR TEXT HERE: how to download a save file and load it on another device or a cleared browser.]', action: 'download' },
      { heading: 'Erase everything on this device', text: '[YOUR TEXT HERE: what Erase does, and that it cannot be undone.]', action: 'erase' },
      { heading: 'What the website host logs',     text: '[YOUR TEXT HERE: written after the privacy research and a check of what the host logs.]', later: true },
      { heading: 'How to ask about your data',     text: '[YOUR TEXT HERE: only matters if data is ever held. To decide.]', later: true }
    ]
  }
};
