import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const english = path.join(dist, "en");
const learn = path.join(english, "learn");
const data = JSON.parse(await readFile(path.join(root, "data", "quests.json"), "utf8"));

await rm(dist, { recursive: true, force: true });
await mkdir(learn, { recursive: true });
await cp(path.join(root, "site"), english, { recursive: true });
await cp(path.join(root, "data"), path.join(english, "data"), { recursive: true });
await cp(path.join(root, "reader", "book.css"), path.join(learn, "book.css"));
await cp(path.join(root, "reader", "book.js"), path.join(learn, "book.js"));
await writeFile(path.join(dist, ".nojekyll"), "", "utf8");

const escapeHtml = value => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const allQuestions = data.levels.flatMap(level => level.questions.map(question => ({ ...question, level })));

function sidebar(active) {
  return `<nav class="book-tree" aria-label="Book contents">
    <a class="tree-home ${active === "home" ? "active" : ""}" href="index.html">Quest book overview</a>
    ${data.levels.map(level => `<details open>
      <summary><span>0${level.number}</span>${escapeHtml(level.shortTitle)}</summary>
      <a class="${active === level.id ? "active" : ""}" href="level-${level.number}.html">${escapeHtml(level.title)}</a>
      ${level.questions.map(question => `<a class="${active === question.slug ? "active" : ""}" href="${question.slug}.html"><span>${question.id}</span>${escapeHtml(question.title)}</a>`).join("")}
    </details>`).join("")}
  </nav>`;
}

function page({ title, active, eyebrow, body, previous, next }) {
  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(eyebrow)} — LeetCode Quest system and software design reader.">
  <title>${escapeHtml(title)} · LeetCode Design Quest</title>
  <link rel="stylesheet" href="book.css">
  <script type="module" src="book.js"></script>
</head>
<body>
  <a class="skip-link" href="#article">Skip to article</a>
  <header class="reader-header">
    <button class="menu-button" id="reader-menu" type="button" aria-label="Open contents" aria-expanded="false">☰</button>
    <a class="reader-brand" href="../"><b>LQ</b><span>DESIGN QUEST</span></a>
    <div class="reader-actions">
      <button id="reader-search-open" type="button" aria-label="Search book" aria-keyshortcuts="/">⌕ <span>Search</span></button>
      <button id="reader-theme" type="button" aria-label="Use light theme" aria-pressed="false">◐</button>
      <a href="../">Atlas ↗</a>
    </div>
  </header>
  <div class="reader-shell">
    <aside id="reader-sidebar"><div class="contents-label">BOOK CONTENTS</div>${sidebar(active)}</aside>
    <main id="article" class="reader-article">
      <div class="article-eyebrow">${escapeHtml(eyebrow)}</div>
      ${body}
      <nav class="page-nav" aria-label="Previous and next pages">
        ${previous ? `<a href="${previous.href}"><span>← PREVIOUS</span><strong>${escapeHtml(previous.title)}</strong></a>` : "<span></span>"}
        ${next ? `<a class="next" href="${next.href}"><span>NEXT →</span><strong>${escapeHtml(next.title)}</strong></a>` : ""}
      </nav>
    </main>
    <aside class="article-outline" aria-label="On this page"><div>ON THIS PAGE</div><nav id="article-outline"></nav></aside>
  </div>
  <dialog id="reader-search"><div class="search-field"><span>⌕</span><label class="sr-only" for="reader-search-input">Search the book</label><input id="reader-search-input" type="search" placeholder="Search 31 pages…"><kbd>ESC</kbd></div><div id="reader-search-results"></div></dialog>
</body>
</html>`;
}

const overviewBody = `<h1>System & Software Design</h1>
<p class="lead">A book-shaped path through LeetCode design questions: from one bounded cache to systems with several synchronized views.</p>
<div class="callout"><strong>How to use this reader</strong><p>Read each level introduction first. Then solve its quests in order. Before opening the editor, write the state, invariants, and target cost on paper.</p></div>
<h2 id="learning-route">The learning route</h2>
<div class="chapter-grid">${data.levels.map(level => `<a href="level-${level.number}.html"><span>LEVEL 0${level.number}</span><h3>${escapeHtml(level.title)}</h3><p>${escapeHtml(level.summary)}</p><b>${level.questions.length} quests →</b></a>`).join("")}</div>
<h2 id="design-loop">The design loop</h2>
<ol><li><strong>Model:</strong> name authoritative and derived state.</li><li><strong>Protect:</strong> state invariants in plain language.</li><li><strong>Index:</strong> use operation costs to choose secondary structures.</li><li><strong>Prove:</strong> trace success, rejection, cleanup, and boundary cases.</li></ol>
<h2 id="source-policy">Source policy</h2>
<p>This reader provides original design guidance and links to LeetCode for problem statements. It does not mirror statements, examples, editorials, or solutions. Premium quests remain marked.</p>`;

await writeFile(path.join(learn, "index.html"), page({ title: "Quest book overview", active: "home", eyebrow: data.version, body: overviewBody, next: { href: "level-1.html", title: data.levels[0].title } }), "utf8");

for (const [levelIndex, level] of data.levels.entries()) {
  const levelBody = `<h1>${escapeHtml(level.title)}</h1>
  <p class="lead">${escapeHtml(level.summary)}</p>
  <div class="level-facts"><div><span>FOUNDATION</span><strong>${escapeHtml(level.foundation)}</strong></div><div><span>QUESTS</span><strong>${level.questions.length}</strong></div><div><span>LEVEL</span><strong>0${level.number} / 05</strong></div></div>
  <h2 id="invariants">Invariants to protect</h2>
  <ul>${level.invariants.map(invariant => `<li>${escapeHtml(invariant)}</li>`).join("")}</ul>
  <h2 id="quest-order">Quest order</h2>
  <div class="quest-table">${level.questions.map(question => `<a href="${question.slug}.html"><span>${question.role}</span><b>LC ${question.id}</b><strong>${escapeHtml(question.title)}</strong><em class="${question.difficulty.toLowerCase()}">${question.difficulty}</em></a>`).join("")}</div>
  <h2 id="exit-check">Level exit check</h2>
  <p>Explain the authoritative state, every secondary index, and one failure-path trace for each quest. You are ready to advance when the complexity argument follows directly from the representation.</p>`;
  const previous = levelIndex === 0 ? { href: "index.html", title: "Quest book overview" } : { href: `level-${level.number - 1}.html`, title: data.levels[levelIndex - 1].title };
  const next = { href: `${level.questions[0].slug}.html`, title: level.questions[0].title };
  await writeFile(path.join(learn, `level-${level.number}.html`), page({ title: level.title, active: level.id, eyebrow: `Level 0${level.number} · ${level.eyebrow}`, body: levelBody, previous, next }), "utf8");
}

for (const [questionIndex, question] of allQuestions.entries()) {
  const urls = { global: `https://leetcode.com/problems/${question.slug}/`, china: `https://leetcode.cn/problems/${question.slug}/` };
  const body = `<h1>${escapeHtml(question.title)}</h1>
  <div class="quest-meta"><span>LC ${question.id}</span><span class="${question.difficulty.toLowerCase()}">${question.difficulty}</span><span>${escapeHtml(question.role)}</span>${question.premium ? "<span>Premium</span>" : ""}</div>
  <p class="lead">${escapeHtml(question.goal)}</p>
  <div class="source-buttons"><a href="${urls.global}" target="_blank" rel="noreferrer">Open on LeetCode ↗</a><a href="${urls.china}" target="_blank" rel="noreferrer">LeetCode 中国 ↗</a></div>
  <h2 id="design-lens">Design lens</h2>
  <p>This quest belongs to <a href="level-${question.level.number}.html">${escapeHtml(question.level.title)}</a>. Its primary construction is <strong>${escapeHtml(question.pattern)}</strong>.</p>
  <h2 id="state-model">State model</h2>
  <p>Begin with the minimum canonical state needed by the public API. Add a secondary structure only when it directly pays for a required lookup, ordering, rank, expiry, or aggregate operation.</p>
  <div class="state-card"><span>PRIMARY PATTERN</span><strong>${escapeHtml(question.pattern)}</strong><p>Write who owns each record and how every index points back to it. Avoid two independently mutable sources of truth.</p></div>
  <h2 id="invariant-check">Invariant check</h2>
  <ul>${question.level.invariants.map(invariant => `<li>${escapeHtml(invariant)}</li>`).join("")}</ul>
  <h2 id="complexity-contract">Complexity contract</h2>
  <p>List every public operation and its target time/space cost from the problem. For each cost, point to the exact primitive operation that achieves it. If cleanup is amortized or a structure is probabilistic, say so explicitly.</p>
  <h2 id="edge-case-lab">Edge-case lab</h2>
  <ul><li>Trace the empty and single-record states.</li><li>Repeat or reject an operation and verify that every index still agrees.</li><li>Cross the boundary that triggers eviction, expiry, replacement, or rebalancing.</li></ul>
  <div class="review-prompt"><span>REVIEW CHECKPOINT</span><strong>${escapeHtml(question.checkpoint)}</strong></div>
  <h2 id="solution-record">Solution record</h2>
  <p>After solving, record the representation, invariants, public-operation costs, one bug you avoided, and one alternative design with its tradeoff. Keep solution code in a language folder rather than copying it into this reader page.</p>`;
  const previousQuestion = allQuestions[questionIndex - 1];
  const nextQuestion = allQuestions[questionIndex + 1];
  const previous = previousQuestion ? { href: `${previousQuestion.slug}.html`, title: previousQuestion.title } : { href: `level-${question.level.number}.html`, title: question.level.title };
  const next = nextQuestion ? { href: `${nextQuestion.slug}.html`, title: nextQuestion.title } : null;
  await writeFile(path.join(learn, `${question.slug}.html`), page({ title: question.title, active: question.slug, eyebrow: `Level 0${question.level.number} · ${question.level.shortTitle}`, body, previous, next }), "utf8");
}

const searchIndex = [
  { title: "Quest book overview", href: "index.html", section: "Overview", text: "learning route design loop source policy" },
  ...data.levels.map(level => ({ title: level.title, href: `level-${level.number}.html`, section: `Level 0${level.number}`, text: `${level.summary} ${level.foundation} ${level.invariants.join(" ")}` })),
  ...allQuestions.map(question => ({ title: question.title, href: `${question.slug}.html`, section: `LC ${question.id} · ${question.level.shortTitle}`, text: `${question.goal} ${question.pattern} ${question.checkpoint}` }))
];
await writeFile(path.join(learn, "search-index.json"), JSON.stringify(searchIndex), "utf8");

await writeFile(path.join(dist, "index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0; url=./en/"><title>LeetCode Design Quest</title><link rel="canonical" href="./en/"></head><body><p><a href="./en/">Open the English atlas</a></p></body></html>`, "utf8");

console.log(`Built English atlas and reader (${data.levels.length + allQuestions.length + 1} reader pages) in dist/.`);
