/* Shared logic for every page. You normally only edit assets/data.js.

   CARDS: chess, skills, stats, achievements, projects.
   Put a card on ANY page with:  <div data-card="projects" data-limit="3"></div>
   The Home page builds its cards from HOME_CARDS in assets/data.js. */
(function () {
  "use strict";

  const $ = s => document.querySelector(s);
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const url = f => esc(encodeURI(f));
  const slug = s => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const isPdf = f => /\.pdf([?#]|$)/i.test(f);
  const thumbOf = f => (!isPdf(f) && /^certificates\/[^/]+$/.test(f)) ? f.replace(/^certificates\//, "certificates/thumbs/") : f;
  const idOf = a => a.id || slug(a.title);
  const truthy = v => v === true || v === "true";
  const ago = iso => { if (!iso) return ""; const d = (Date.now() - new Date(iso)) / 864e5; if (d < 1) return "today"; if (d < 30) return Math.floor(d) + "d ago"; if (d < 365) return Math.floor(d / 30) + "mo ago"; return Math.floor(d / 365) + "y ago"; };

  /* ---------- crosshair cursor ---------- */
  const h = el("div", "crosshair"); h.id = "horizontal";
  const v = el("div", "crosshair"); v.id = "vertical";
  document.body.append(h, v);
  document.addEventListener("mousemove", e => { h.style.top = e.clientY + "px"; v.style.left = e.clientX + "px"; });

  /* If a small preview image is missing, fall back to the full-size file. */
  document.addEventListener("error", e => {
    const t = e.target;
    if (t.tagName === "IMG" && t.dataset.full) { const f = t.dataset.full; delete t.dataset.full; t.src = f; }
  }, true);

  /* ---------- nav + footer ---------- */
  const here = (location.pathname.split("/").pop() || "index").replace(/\.html$/, "");
  const NAV = [["Home", "index.html"], ["Chess", "chess.html"], ["Skills", "skills.html"], ["Projects", "projects.html"], ["Certificates", "certificates.html"]];
  const nav = $("#nav");
  if (nav) {
    nav.innerHTML = `<div class="wrap"><b>FireClashing</b>${NAV.map(([l, href]) => {
      const active = href.replace(/\.html$/, "") === here;
      return `<a href="${href}"${active ? ' class="active" aria-current="page"' : ""}>${l}</a>`;
    }).join("")}</div>`;
  }
  const foot = $("#contact");
  if (foot) {
    const links = [...CONFIG.contact];
    if (!CONFIG.githubUser.startsWith("YOUR_") && !links.some(l => /github/i.test(l.label))) links.unshift({ label: "GitHub", url: `https://github.com/${CONFIG.githubUser}` });
    links.push({ label: "Chess profile", url: CONFIG.chessSite === "lichess" ? `https://lichess.org/@/${CONFIG.chessUser}` : `https://www.chess.com/member/${CONFIG.chessUser}` });
    foot.innerHTML = `<div class="wrap"><div class="links">${links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("")}</div></div>`;
  }
  const tag = $("#tagline");
  if (tag) tag.innerHTML = esc(CONFIG.tagline).replace(/\/\//g, "<span>//</span>");
  const sub = $("#subtagline");
  if (sub) sub.textContent = CONFIG.subtagline || "";

  /* =========================================================
     DATA HELPERS
     ========================================================= */
  const LANG = { JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5", HTML: "#e34c26", CSS: "#563d7c", C: "#8a8a8a", "C++": "#f34b7d", Java: "#b07219", Go: "#00ADD8", Rust: "#dea584", Shell: "#89e051", PHP: "#4F5D95", "C#": "#178600", Ruby: "#701516" };

  let projectsP;
  function getProjects() {
    if (!projectsP) projectsP = (async () => {
      const list = [];
      if (!CONFIG.githubUser.startsWith("YOUR_")) {
        const r = await fetch(`https://api.github.com/users/${CONFIG.githubUser}/repos?per_page=100&sort=pushed`);
        if (!r.ok) throw new Error(r.status);
        (await r.json()).forEach(x => {
          if ((CONFIG.hideForks && x.fork) || CONFIG.hideRepos.includes(x.name)) return;
          const ov = PROJECT_OVERRIDES[x.name] || {};
          if (ov.hide) return;
          list.push({
            title: ov.title || x.name, description: ov.description || x.description || "No description yet.",
            url: x.html_url, demo: ov.demo || x.homepage || "", image: ov.image || "", tags: ov.tags || x.topics || [],
            language: x.language, stars: x.stargazers_count, forks: x.forks_count, updated: x.pushed_at,
            pin: !!ov.pin, status: ov.status || "", order: ov.order
          });
        });
      }
      EXTRA_PROJECTS.forEach(e => list.push({ description: "", url: "", demo: "", image: "", tags: [], pin: false, status: "", ...e }));
      list.sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || (a.order ?? 999) - (b.order ?? 999));
      return list;
    })();
    return projectsP;
  }

  /* =========================================================
     CARD RENDERERS  (each takes a container + options)
     ========================================================= */

  /* ---- chess ---- */
  const modeCard = (name, rating, meta) => `<div class="card mode"><div class="name">${esc(name)}</div><div class="rating">${rating ?? "–"}</div><div class="meta">${meta || ""}</div></div>`;
  async function loadChessCom(u) {
    const r = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(u.toLowerCase())}/stats`);
    if (!r.ok) throw new Error("chess.com " + r.status);
    const d = await r.json(), out = [];
    [["chess_rapid", "Rapid"], ["chess_blitz", "Blitz"], ["chess_bullet", "Bullet"], ["chess_daily", "Daily"]].forEach(([k, n]) => {
      const s = d[k]; if (!s) return;
      const rec = s.record || {};
      out.push(modeCard(n, s.last?.rating, `best ${s.best?.rating ?? "–"} · ${rec.win ?? 0}W ${rec.loss ?? 0}L ${rec.draw ?? 0}D`));
    });
    if (d.tactics?.highest) out.push(modeCard("Puzzles", d.tactics.highest.rating, "highest rating"));
    return { site: "Chess.com", html: out.join("") };
  }
  async function loadLichess(u) {
    const r = await fetch(`https://lichess.org/api/user/${encodeURIComponent(u)}`);
    if (!r.ok) throw new Error("lichess " + r.status);
    const d = await r.json(), out = [];
    ["rapid", "blitz", "bullet", "classical", "puzzle"].forEach(k => {
      const p = d.perfs?.[k]; if (!p || (!p.games && k !== "puzzle")) return;
      out.push(modeCard(k[0].toUpperCase() + k.slice(1), p.rating, k === "puzzle" ? `${p.games || 0} solved` : `${p.games} games`));
    });
    return { site: "Lichess", html: out.join("") };
  }
  function renderChess(box) {
    box.innerHTML = `<div class="live"><span class="dot off"></span><span class="cs">Loading…</span></div><div class="chess"></div>`;
    const dot = box.querySelector(".dot"), st = box.querySelector(".cs"), grid = box.querySelector(".chess");
    async function load() {
      const u = CONFIG.chessUser, site = CONFIG.chessSite;
      try {
        let res;
        if (site === "lichess") res = await loadLichess(u);
        else if (site === "chesscom") res = await loadChessCom(u);
        else { try { res = await loadChessCom(u); } catch (e) { res = await loadLichess(u); } }
        grid.innerHTML = res.html || `<div class="card note">No rated games found for ${esc(u)} yet.</div>`;
        dot.classList.remove("off");
        st.innerHTML = `${esc(u)} on ${res.site} · updated ${new Date().toLocaleTimeString()}`;
      } catch (e) {
        dot.classList.add("off");
        st.textContent = `Could not reach the chess API for ${u}. Retrying in a minute.`;
      }
    }
    load(); setInterval(load, 60000);
  }

  /* ---- skills ---- */
  function renderSkills(box) {
    box.innerHTML = `<div class="skills"><div class="card radarbox"><svg class="radar" viewBox="-50 6 500 354" role="img" aria-label="Skill radar chart"></svg></div>
      <div><div class="tools">${TOOLS.map(t => `<span class="${esc(t.team)}">${esc(t.name)}</span>`).join("")}</div>
      <div class="legend"><span class="red">Red team (offensive)</span><span class="blue">Blue team (defensive)</span></div></div></div>`;
    const cx = 200, cy = 180, R = 120, n = SKILLS.length, pt = (i, val) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * R * val / 100, cy + Math.sin(a) * R * val / 100]; };
    let svg = "";
    [25, 50, 75, 100].forEach(l => { svg += `<polygon points="${SKILLS.map((_, i) => pt(i, l).join(",")).join(" ")}" fill="none" stroke="#1a2a3a"/>`; });
    SKILLS.forEach((s, i) => {
      const [x, y] = pt(i, 100), [lx, ly] = pt(i, 122);
      svg += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#1a2a3a"/>`;
      const anchor = lx < cx - 10 ? "end" : lx > cx + 10 ? "start" : "middle";
      const short = s.name.split(" & ")[0].replace("Active Directory attacks", "AD attacks").replace("Web app exploitation", "Web exploitation");
      const lines = []; let curL = "";
      short.split(/(?<=-)|\s+/).filter(Boolean).forEach(w => {
        if (curL && (curL + " " + w).length > 13) { lines.push(curL); curL = w; }
        else curL = curL ? curL + (curL.endsWith("-") ? "" : " ") + w : w;
      });
      lines.push(curL);
      svg += `<text x="${lx}" y="${ly + 4 - (lines.length - 1) * 7}" text-anchor="${anchor}">${lines.map((t, k) => `<tspan x="${lx}" dy="${k ? 14 : 0}">${esc(t)}</tspan>`).join("")}</text>`;
    });
    svg += `<polygon points="${SKILLS.map((s, i) => pt(i, s.level).join(",")).join(" ")}" fill="rgba(29,233,200,.2)" stroke="#1de9c8" stroke-width="2"/>`;
    SKILLS.forEach((s, i) => { const [x, y] = pt(i, s.level); svg += `<circle cx="${x}" cy="${y}" r="3.5" fill="#ff4d5e"/>`; });
    box.querySelector(".radar").innerHTML = svg;
  }

  /* ---- stats ---- */
  function renderStats(box) {
    const count = t => ACHIEVEMENTS.filter(a => String(a.type).toLowerCase() === t).length;
    const b = (n, l, cls) => `<div class="card stat"><b class="${cls || ""}">${n}</b><span>${l}</span></div>`;
    box.innerHTML = `<div class="stats">${b(ACHIEVEMENTS.length, "achievements")}${b(count("ctf"), "CTFs played")}${b(count("certification"), "certifications")}${b("–", "projects", "sp")}</div>`;
    getProjects().then(l => { box.querySelector(".sp").textContent = l.length; }).catch(() => {});
  }

  /* ---- projects ---- */
  const initials = t => { const w = String(t).replace(/[^a-z0-9]+/gi, " ").trim().split(" "); return (w.length > 1 ? w[0][0] + w[1][0] : (w[0] || "?").slice(0, 2)).toUpperCase(); };
  function projCard(p) {
    const col = LANG[p.language] || "#1de9c8";
    const cover = p.image ? `<div class="cover"><img src="${url(p.image)}" alt="" loading="lazy"></div>` : `<div class="cover gen" style="--c:${col}"><span>${esc(initials(p.title))}</span></div>`;
    const title = p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)}</a>` : esc(p.title);
    return `<article class="card proj${p.pin ? " pinned" : ""}">${cover}
      ${p.pin ? `<span class="pinb">PINNED</span>` : ""}${p.status ? `<span class="statb">${esc(p.status)}</span>` : ""}
      <div class="pbody"><h3>${title}</h3><p>${esc(p.description)}</p>
        ${p.tags.length ? `<div class="tags">${p.tags.slice(0, 4).map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
        <div class="foot">${p.language ? `<span class="lang"><i style="background:${col}"></i>${esc(p.language)}</span>` : ""}
          ${p.stars != null ? `<span>★ ${p.stars}</span><span>⑂ ${p.forks}</span>` : ""}${p.updated ? `<span>updated ${ago(p.updated)}</span>` : ""}</div>
        <div class="actions">${p.url ? `<a class="btn sm" href="${esc(p.url)}" target="_blank" rel="noopener">Code</a>` : ""}${p.demo ? `<a class="btn sm ghost" href="${esc(p.demo)}" target="_blank" rel="noopener">Live demo</a>` : ""}</div>
      </div></article>`;
  }
  async function renderProjects(box, o) {
    const limit = parseInt(o.limit, 10) || 0, filters = truthy(o.filters);
    box.innerHTML = `<div class="card note">Loading projects…</div>`;
    let list;
    try { list = await getProjects(); }
    catch (e) { box.innerHTML = `<div class="card note">GitHub did not respond (rate limit or wrong username). Reload in a few minutes, or <a href="https://github.com/${esc(CONFIG.githubUser)}?tab=repositories">view repositories on GitHub</a>.</div>`; return; }
    const pc = $("#projCount"); if (pc) pc.textContent = `${list.length} ${list.length === 1 ? "project" : "projects"}`;
    if (!list.length) { box.innerHTML = `<div class="card note">${CONFIG.githubUser.startsWith("YOUR_") ? "Set <b>githubUser</b> in assets/data.js to show your repositories." : "No public repositories to show yet."}</div>`; return; }
    if (!filters) { box.innerHTML = `<div class="pgrid">${(limit ? list.slice(0, limit) : list).map(projCard).join("")}</div>`; return; }
    const langs = [...new Set(list.map(p => p.language).filter(Boolean))];
    box.innerHTML = `<div class="ptools"><input type="search" placeholder="Search projects…" aria-label="Search projects">
      <div class="filters">${["All", ...langs].map(l => `<button type="button" data-l="${esc(l)}">${esc(l)} (${l === "All" ? list.length : list.filter(p => p.language === l).length})</button>`).join("")}</div></div>
      <div class="pgrid wide"></div><p class="note empty" hidden>No project matches.</p>`;
    const grid = box.querySelector(".pgrid"), empty = box.querySelector(".empty"), btns = [...box.querySelectorAll(".filters button")];
    let lang = "All", q = "";
    const draw = () => {
      const out = list.filter(p => (lang === "All" || p.language === lang) && (!q || [p.title, p.description, ...p.tags].join(" ").toLowerCase().includes(q)));
      grid.innerHTML = out.map(projCard).join(""); empty.hidden = !!out.length;
      btns.forEach(b => b.setAttribute("aria-pressed", b.dataset.l === lang));
    };
    box.querySelector("input").addEventListener("input", e => { q = e.target.value.trim().toLowerCase(); draw(); });
    box.querySelector(".filters").addEventListener("click", e => { const b = e.target.closest("button[data-l]"); if (b) { lang = b.dataset.l; draw(); } });
    draw();
  }

  /* ---- achievements (cards that link to certificates.html#id) ---- */
  function tileMedia(m) {
    return isPdf(m.file)
      ? `<iframe src="${url(m.file)}#toolbar=0&navpanes=0&view=FitH" loading="lazy" tabindex="-1" title=""></iframe>`
      : `<img src="${url(thumbOf(m.file))}" data-full="${url(m.file)}" alt="" loading="lazy" decoding="async">`;
  }
  function achCard(a, asLink) {
    const m = a.media || [], shown = m.slice(0, 3), extra = m.length - 3;
    const tiles = shown.map((x, i) => `<div class="tile">${tileMedia(x)}${x.label ? `<span class="lab">${esc(x.label)}</span>` : ""}${i === 2 && extra > 0 ? `<span class="plus">+${extra}</span>` : ""}</div>`).join("");
    const inner = `<div class="collage n${shown.length || 1}">${tiles}</div>
      ${a.type ? `<span class="chip t-${slug(a.type)}">${esc(a.type)}</span>` : ""}${a.rank ? `<span class="rank">RANK ${esc(a.rank)}</span>` : ""}
      <div class="info"><h3>${esc(a.title)}</h3><p>${esc([a.issuer, a.year].filter(Boolean).join(" · "))}</p>${a.note ? `<p class="res">${esc(a.note)}</p>` : ""}</div>`;
    const label = `${a.title}${a.rank ? ", rank " + a.rank : ""}, ${m.length} item${m.length === 1 ? "" : "s"}`;
    return asLink
      ? `<a class="card ach" href="certificates.html#${esc(idOf(a))}" aria-label="${esc(label)}">${inner}</a>`
      : `<button class="card ach" type="button" data-id="${esc(idOf(a))}" aria-label="Open ${esc(label)}">${inner}</button>`;
  }
  function renderAchievements(box, o) {
    let list = ACHIEVEMENTS;
    if (o.type) list = list.filter(a => String(a.type).toLowerCase() === String(o.type).toLowerCase());
    const f = list.filter(a => a.featured); if (f.length && !o.type) list = f;
    list = list.slice(0, parseInt(o.limit, 10) || 3);
    box.innerHTML = list.length ? `<div class="agrid">${list.map(a => achCard(a, true)).join("")}</div>` : `<div class="card note">No achievements to show yet.</div>`;
  }

  /* =========================================================
     HOME TILES: small link cards, one per page (live number + "Open")
     ========================================================= */
  async function chessSummary() {
    const u = CONFIG.chessUser, site = CONFIG.chessSite;
    const cc = async () => {
      const r = await fetch(`https://api.chess.com/pub/player/${encodeURIComponent(u.toLowerCase())}/stats`); if (!r.ok) throw 0;
      const d = await r.json();
      for (const [k, n] of [["chess_rapid", "Rapid"], ["chess_blitz", "Blitz"], ["chess_bullet", "Bullet"]]) { const x = d[k]?.last?.rating; if (x) return { value: x, sub: `${n} rating · Chess.com live` }; }
      throw 0;
    };
    const li = async () => {
      const r = await fetch(`https://lichess.org/api/user/${encodeURIComponent(u)}`); if (!r.ok) throw 0;
      const d = await r.json();
      for (const k of ["rapid", "blitz", "bullet", "classical"]) { const p = d.perfs?.[k]; if (p?.games) return { value: p.rating, sub: `${k[0].toUpperCase() + k.slice(1)} rating · Lichess live` }; }
      throw 0;
    };
    if (site === "lichess") return li();
    if (site === "chesscom") return cc();
    try { return await cc(); } catch (e) { return li(); }
  }
  const countType = t => ACHIEVEMENTS.filter(a => String(a.type).toLowerCase() === t).length;
  const TILES = {
    chess:        { label: "Chess",        href: "chess.html",        load: async () => { try { return await chessSummary(); } catch (e) { return { value: "–", sub: "rating unavailable right now" }; } } },
    skills:       { label: "Skills",       href: "skills.html",       load: async () => ({ value: SKILLS.length, sub: `red team skills · ${TOOLS.length} tools` }) },
    achievements: { label: "Certificates", href: "certificates.html", load: async () => ({ value: ACHIEVEMENTS.length, sub: `${countType("ctf")} CTFs · ${countType("certification")} certifications` }) },
    projects:     { label: "Projects",     href: "projects.html",     load: async () => { try { const l = await getProjects(); return { value: l.length, sub: l.length ? `latest: ${l[0].title}` : "no projects yet" }; } catch (e) { return { value: "–", sub: "GitHub unavailable right now" }; } } }
  };
  function renderTile(c) {
    const t = TILES[c.card];
    const a = el("a", "dcard card htile size-" + (c.size || "half"));
    a.href = t.href;
    a.innerHTML = `<span class="t-label">${esc(c.title || t.label)}</span><b class="t-val">…</b><span class="t-sub">&nbsp;</span><span class="t-go">Open ${esc(c.title || t.label)} &rarr;</span>`;
    t.load().then(r => { a.querySelector(".t-val").textContent = r.value; a.querySelector(".t-sub").textContent = r.sub; });
    return a;
  }

  /* =========================================================
     CARD REGISTRY + MOUNTING
     ========================================================= */
  const CARDS = {
    stats:        { title: "",                     size: "full", render: renderStats },
    chess:        { title: "Live chess rating",    size: "half", render: renderChess,        href: "chess.html" },
    skills:       { title: "Red team skill matrix", size: "half", render: renderSkills,       href: "skills.html" },
    achievements: { title: "Achievements",         size: "full", render: renderAchievements, href: "certificates.html" },
    projects:     { title: "Projects",             size: "full", render: renderProjects,     href: "projects.html" }
  };
  function mount(box, name, opts) {
    const c = CARDS[name];
    if (!c) { box.innerHTML = `<div class="card note">Unknown card "${esc(name)}". Use: ${Object.keys(CARDS).join(", ")}.</div>`; return; }
    c.render(box, opts || {});
  }

  /* Home page: build the card grid from HOME_CARDS */
  const home = $("#homeCards");
  if (home) {
    if (HOME_CARDS.length) { document.body.classList.remove("home"); const hf = $(".hero.full"); if (hf) hf.classList.remove("full"); }
    HOME_CARDS.forEach(c => {
      if ((c.view || "tile") === "tile" && TILES[c.card]) { home.appendChild(renderTile(c)); return; }
      const def = CARDS[c.card] || {};
      const title = c.title !== undefined ? c.title : def.title;
      const sec = el("section", "dcard size-" + (c.size || def.size || "full"));
      sec.innerHTML = `${title ? `<div class="dc-head"><h3>${esc(title)}</h3>${def.href ? `<a class="more" href="${def.href}">View all &rarr;</a>` : ""}</div>` : ""}<div class="dc-body"></div>`;
      home.appendChild(sec);
      mount(sec.querySelector(".dc-body"), c.card, c);
    });
  }
  /* Any other page: <div data-card="name" data-limit="3"></div> */
  document.querySelectorAll("[data-card]").forEach(b => mount(b, b.dataset.card, { ...b.dataset }));

  /* =========================================================
     CERTIFICATES PAGE: filters + viewer
     ========================================================= */
  const grid = $("#achGrid");
  let activeType = "All";
  function drawAch() {
    if (!ACHIEVEMENTS.length) { grid.innerHTML = `<div class="card note">Add entries to the ACHIEVEMENTS list in assets/data.js.</div>`; return; }
    const types = ["All", ...new Set(ACHIEVEMENTS.map(a => a.type).filter(Boolean))];
    const countOf = t => t === "All" ? ACHIEVEMENTS.length : ACHIEVEMENTS.filter(a => a.type === t).length;
    $("#filters").innerHTML = types.length > 2 ? types.map(t => `<button type="button" data-t="${esc(t)}" aria-pressed="${t === activeType}">${esc(t)} (${countOf(t)})</button>`).join("") : "";
    grid.innerHTML = ACHIEVEMENTS.filter(a => activeType === "All" || a.type === activeType).map(a => achCard(a, false)).join("");
  }

  let V, cur = null, idx = 0, lastFocus = null;
  function buildViewer() {
    V = el("div", "modal");
    V.setAttribute("role", "dialog"); V.setAttribute("aria-modal", "true"); V.setAttribute("aria-labelledby", "vTitle");
    V.innerHTML = `<header><div><h3 id="vTitle"></h3><p id="vSub"></p></div>
        <div class="actions"><a class="btn" id="vOpen" target="_blank" rel="noopener">Open file</a><button class="btn" id="vClose" type="button">Close</button></div></header>
      <div class="vstage"><button class="navbtn" id="vPrev" type="button" aria-label="Previous image">‹</button><div class="vmedia" id="vMedia"></div><button class="navbtn" id="vNext" type="button" aria-label="Next image">›</button></div>
      <div class="strip" id="vStrip"></div>`;
    document.body.appendChild(V);
    $("#vClose").onclick = closeAch;
    $("#vPrev").onclick = () => step(-1);
    $("#vNext").onclick = () => step(1);
    V.addEventListener("click", e => { if (e.target === V || e.target.id === "vMedia" || e.target.classList.contains("vstage")) closeAch(); });
    $("#vStrip").addEventListener("click", e => { const b = e.target.closest("button[data-i]"); if (b) { idx = +b.dataset.i; showMedia(); } });
  }
  function showMedia() {
    const m = cur.media[idx];
    $("#vMedia").innerHTML = isPdf(m.file)
      ? `<iframe src="${url(m.file)}#view=FitH" title="${esc(m.label || cur.title)}"></iframe>`
      : `<img src="${url(m.file)}" alt="${esc(cur.title + (m.label ? " - " + m.label : ""))}">`;
    $("#vOpen").href = encodeURI(m.file);
    $("#vStrip").querySelectorAll("button").forEach((b, i) => b.setAttribute("aria-current", i === idx));
  }
  function step(d) { if (cur && cur.media.length > 1) { idx = (idx + d + cur.media.length) % cur.media.length; showMedia(); } }
  function openAch(a) {
    if (!V) buildViewer();
    if (!a.media || !a.media.length) return;
    cur = a; idx = 0; lastFocus = document.activeElement;
    $("#vTitle").textContent = a.title;
    $("#vSub").innerHTML = esc([a.issuer, a.year].filter(Boolean).join(" · ")) + (a.rank ? ` · <b>Rank ${esc(a.rank)}</b>` : "") + (a.note ? ` · ${esc(a.note)}` : "");
    const many = a.media.length > 1;
    $("#vPrev").style.visibility = $("#vNext").style.visibility = many ? "visible" : "hidden";
    $("#vStrip").style.display = many ? "flex" : "none";
    $("#vStrip").innerHTML = a.media.map((m, i) => `<button type="button" data-i="${i}" aria-label="Show ${esc(m.label || "image " + (i + 1))}">${isPdf(m.file) ? `<div class="pdfbox">PDF</div>` : `<img src="${url(thumbOf(m.file))}" data-full="${url(m.file)}" alt="">`}<span>${esc(m.label || "Image " + (i + 1))}</span></button>`).join("");
    showMedia();
    V.classList.add("open"); document.body.style.overflow = "hidden";
    $("#vClose").focus();
    history.replaceState(null, "", "#" + idOf(a));
  }
  function closeAch() {
    if (!V) return;
    V.classList.remove("open"); $("#vMedia").innerHTML = ""; document.body.style.overflow = ""; cur = null;
    history.replaceState(null, "", location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener("keydown", e => {
    if (!V || !V.classList.contains("open")) return;
    if (e.key === "Escape") closeAch();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  if (grid) {
    drawAch();
    grid.addEventListener("click", e => {
      const b = e.target.closest("button[data-id]"); if (!b) return;
      const a = ACHIEVEMENTS.find(x => idOf(x) === b.dataset.id); if (a) openAch(a);
    });
    $("#filters").addEventListener("click", e => {
      const b = e.target.closest("button[data-t]"); if (!b) return;
      activeType = b.dataset.t; drawAch();
    });
    const fromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const a = id && ACHIEVEMENTS.find(x => idOf(x) === id);
      if (a) { activeType = "All"; drawAch(); openAch(a); }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
  }
})();
