# How to edit this site

Everything you change lives in **`assets/data.js`**. The three pages (`index.html`, `projects.html`, `certificates.html`) rebuild themselves from it.

## Add a CTF with its certificate AND its position (collage card)

1. Put the files in `certificates/`, e.g. `certificates/hackfest.jpg` (certificate) and `certificates/hackfest-scoreboard.png` (screenshot of your rank).
2. Add an entry to `ACHIEVEMENTS` in `assets/data.js`:

```js
{
  id: "hackfest-ctf", title: "HackFest CTF", type: "CTF", issuer: "HackFest", year: 2026,
  rank: "#3",                                   // gold badge on the card (optional)
  note: "Top 1% of 500 teams · 2300 pts",       // one line under the title (optional)
  media: [
    { file: "certificates/hackfest.jpg",            label: "Certificate" },
    { file: "certificates/hackfest-scoreboard.png", label: "Final scoreboard" },
    { file: "certificates/hackfest-solves.png",     label: "Challenges solved" }
  ]
}
```

The card shows up to 3 images as a collage (`+N` if you add more). Clicking it opens every image full size with arrows, thumbnails and keyboard support. PDFs work too: `{ file: "certificates/x.pdf", label: "Certificate" }`.

The first two CTF entries already have commented-out lines where the scoreboard images go. Remove the `//` once you add the files.

## Home page = banner + one tile per page

Each tile shows a live number (chess rating, number of projects, certificates, skills) and opens its own page. Nothing is crammed onto Home. Edit `HOME_CARDS` at the top of `assets/data.js`:

```js
const HOME_CARDS = [
  { card: "achievements", size: "quarter" },
  { card: "projects",     size: "quarter" },
  { card: "chess",        size: "quarter" },
  { card: "skills",       size: "quarter" }
];
```

Delete a line to remove a tile, reorder lines to move them, or use `[]` for a banner-only home. `size` can be `quarter` (4 per row), `third`, `half` or `full`. Add `title: "My Name"` to rename a tile.

**Pages:** `index.html` (Home), `chess.html`, `skills.html`, `projects.html`, `certificates.html`.

**Embed a whole feature somewhere (optional):** `{ card: "projects", view: "full", limit: 3 }` shows the full card on Home, and `<div data-card="projects" data-limit="3"></div>` works on any page. Cards: `stats`, `chess`, `skills`, `achievements`, `projects`.

## Customise your repos

In `assets/data.js`, `PROJECT_OVERRIDES` lets you restyle each repo by its exact name:

```js
const PROJECT_OVERRIDES = {
  "my-repo": {
    title: "Nice Title", description: "What it does.",
    image: "assets/projects/my-repo.png",     // wide cover picture, about 800x400
    tags: ["Red Team", "Python"], status: "WIP",
    demo: "https://...", pin: true, order: 1   // pin = big card at the top
  },
  "boring-repo": { hide: true }
};
```

Repos without a cover image get a generated one in the language colour. `EXTRA_PROJECTS` adds projects that are not on GitHub. The Projects page also has a search box and language filters.

## Faster loading (optional)

Certificate scans are big. To make small preview copies:

```
pip install pillow
python tools/make-thumbs.py
```

This fills `certificates/thumbs/` with the same file names. The pages use them for cards and fall back to the full image if a preview is missing. Commit the `thumbs` folder too.

## Other things in `assets/data.js`

- `CONFIG`: GitHub username, chess username, contact links, taglines.
- `SKILLS`: radar chart values (0-100).
- `TOOLS`: tool chips, `team: "red"` or `"blue"`.

## Deep links

`certificates.html#slay-ctf` opens that achievement straight away (the part after `#` is the entry's `id`). Handy for your CV or LinkedIn.
