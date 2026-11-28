/* =========================================================
   EDIT THIS FILE. All three pages update themselves from it.
   ========================================================= */
const CONFIG = {
  githubUser: "FireClashing",
  chessUser:  "fire_clashing",
  chessSite:  "auto",                   // "chesscom", "lichess" or "auto" (tries Chess.com, then Lichess)
  hideForks:  true,
  hideRepos:  [],                       // e.g. ["FireClashing.github.io"]
  tagline:    "red team // developer // chess player",
  subtagline: "moving pawn will promote to strongest piece",
  contact: [
    // { label: "LinkedIn", url: "https://www.linkedin.com/in/your-name" },
    // { label: "Email",    url: "mailto:you@example.com" },
  ]
};

/* ---------------------------------------------------------
   HOME PAGE = banner + one small tile per page.
   Each tile shows a live number and opens its own page,
   so nothing is crammed onto the home page.

   card    achievements | projects | chess | skills   (stats also works with view:"full")
   size    "quarter" (4 per row), "third" (3), "half" (2) or "full"
   title   OPTIONAL: change the tile name
   view    OPTIONAL: "tile" (default) or "full" to embed the whole card on Home
           (full also accepts limit: 3)
   Delete a line to remove a tile, reorder lines to move it,
   or use [] for a banner-only home page.
   --------------------------------------------------------- */
const HOME_CARDS = [
  { card: "achievements", size: "quarter" },
  { card: "projects",     size: "quarter" },
  { card: "chess",        size: "quarter" },
  { card: "skills",       size: "quarter" }
];

/* ---------------------------------------------------------
   CUSTOMISE YOUR REPOS (all optional)
   Key = the exact GitHub repo name. Fields you can set:
     title, description   override what GitHub shows
     image                cover picture, e.g. "assets/projects/mytool.png" (wide, ~800x400)
     tags                 ["Red Team", "Python"]  (replaces GitHub topics)
     demo                 live demo / writeup link
     status               small badge, e.g. "WIP", "Stable", "Archived"
     pin                  true = big card at the top
     order                1, 2, 3... to control the order of pinned/ordered repos
     hide                 true = don't show this repo
   --------------------------------------------------------- */
const PROJECT_OVERRIDES = {
  // "my-repo-name": { title: "Nice Title", description: "What it does.", image: "assets/projects/my-repo.png", tags: ["Red Team","Python"], status: "WIP", pin: true },
};

// Projects that are NOT on GitHub (or private). Same fields as above, plus url.
const EXTRA_PROJECTS = [
  // { title: "Internal Recon Tool", description: "...", url: "https://...", tags: ["OSINT"], language: "Python" },
];

// Skill levels are out of 100. Be honest, intermediate is 31-60.
const SKILLS = [
  { name: "Scripting",                  level: 70 },
  { name: "Recon & OSINT",              level: 50 },
  { name: "Privilege escalation",       level: 30 },
  { name: "Active Directory attacks",   level: 10 },
  { name: "Reverse Eng.",               level: 60 },
  { name: "Post-exploitation",          level: 35 },
  { name: "Evasion & payload basics",   level: 30 },
  { name: "Web pentesting",             level: 70 }
];

// team: "red" = offensive, "blue" = defensive/analysis. Add blue tools here too (e.g. Splunk, Wazuh, Snort).
const TOOLS = [
  {name:"Nmap",team:"red"},{name:"Burp Suite",team:"red"},{name:"Curl",team:"red"},
  {name:"Hydra",team:"red"},{name:"Gobuster",team:"red"},{name:"SQLmap",team:"red"},
  {name:"John / Hashcat",team:"red"},{name:"Arch Linux",team:"red"},{name:"Wireshark",team:"blue"},
  {name:"Python",team:"red"},{name:"Bash",team:"red"}
];

/* ---------------------------------------------------------
   ACHIEVEMENTS  (shown on the certificates page)

   One entry = one card. The card is a COLLAGE of everything in `media`,
   so put the certificate AND the proof (scoreboard, rank, profile) together.

   Fields
     id        short unique name, used in links (certificates.html#slay-ctf)
     title     card title
     type      "CTF", "Certification" or "Coding". This makes the filter buttons
               (any new word works and gets its own button)
     issuer    who gave it / organiser
     year      year
     rank      OPTIONAL gold badge on the card, e.g. "#7" or "1st"
     note      OPTIONAL one line shown under the title, e.g. "Top 3% of 340 teams · 1450 pts"
     featured  OPTIONAL true = preferred for the Home "achievements" card
     media     list of files. First one is the big tile.
               { file: "certificates/x.jpg", label: "Certificate" }
               Images (.jpg .png .webp) and PDFs both work.
               Optional small preview copies in certificates/thumbs/ with the SAME
               file name load faster (see HOW-TO-EDIT.md).
   --------------------------------------------------------- */
const ACHIEVEMENTS = [
  {
    id: "nx-blackout-ctf", title: "NX-BLACKOUT_CTF", type: "CTF", issuer: "NEXPLOIT", year: 2026, featured: true,
    // rank: "#?",  note: "Final position, points, number of teams",
    media: [
      { file: "certificates/NX-BLACKOUT_ctf.jpg", label: "Certificate" },
      // { file: "certificates/nx-blackout-scoreboard.png", label: "Final scoreboard" },
      // { file: "certificates/nx-blackout-solves.png",     label: "Challenges solved" },
    ]
  },
  {
    id: "slay-ctf", title: "SLAY_CTF", type: "CTF", issuer: "Jalpaiguri Government Engineering College", year: 2026, featured: true,
    // rank: "#?",  note: "Final position, points, number of teams",
    media: [
      { file: "certificates/slay_ctf.jpg", label: "Certificate" },
      // { file: "certificates/slay-scoreboard.png", label: "Final scoreboard" },
    ]
  },
  {
    id: "thm-cyber-security-101", title: "TryHackMe: Cyber Security 101", type: "Certification", issuer: "TryHackMe", year: 2026, featured: true,
    media: [{ file: "certificates/Cyber-Security 101.jpg", label: "Certificate" }]
  },
  {
    id: "thm-pre-security", title: "TryHackMe: Pre Security", type: "Certification", issuer: "TryHackMe", year: 2026,
    media: [{ file: "certificates/pre-SecurityTHM.jpg", label: "Certificate" }]
  },
  {
    id: "code-auction", title: "Code Auction", type: "Coding", issuer: "IEEE GTB4CEC", year: 2026,
    media: [{ file: "certificates/CODE-auction.jpg", label: "Certificate" }]
  }
];
