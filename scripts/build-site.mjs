import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import level12Solutions from "../data/solutions/levels-1-2.mjs";
import level34Solutions from "../data/solutions/levels-3-4.mjs";
import level5Solutions from "../data/solutions/level-5.mjs";

const root = path.resolve(import.meta.dirname, "..");
const dist = path.join(root, "dist");
const english = path.join(dist, "en");
const learn = path.join(english, "learn");
const data = JSON.parse(await readFile(path.join(root, "data", "quests.json"), "utf8"));
const thinking = JSON.parse(await readFile(path.join(root, "data", "thinking.json"), "utf8"));
const solutions = { ...level12Solutions, ...level34Solutions, ...level5Solutions };

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

const complexityWidth = value => {
  const cost = String(value).toLowerCase().replaceAll(" ", "");
  if (cost.includes("o(1)") || cost.includes("o(5)") || cost.includes("o(10)")) return 20;
  if (cost.includes("log")) return 42;
  if (cost.includes("sqrt")) return 58;
  if (cost.includes("n²") || cost.includes("n^2")) return 100;
  if (cost.includes("n") || cost.includes("k") || cost.includes("f") || cost.includes("m")) return 76;
  return 54;
};

function structureDiagram(diagram) {
  const labels = Object.fromEntries(diagram.nodes.map(node => [node.id, node.label]));
  return `<figure class="structure-graph">
    <figcaption>${escapeHtml(diagram.caption)}</figcaption>
    <div class="graph-node-grid">${diagram.nodes.map((node, index) => `<div class="graph-node"><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(node.label)}</strong></div>`).join("")}</div>
    <div class="graph-edge-list" aria-label="Data structure relationships">${diagram.edges.map(edge => `<div><b>${escapeHtml(labels[edge.from] ?? edge.from)}</b><i>→</i><b>${escapeHtml(labels[edge.to] ?? edge.to)}</b><span>${escapeHtml(edge.label)}</span></div>`).join("")}</div>
  </figure>`;
}

function codeWorkbench(question, solution) {
  const pythonTab = `python-tab-${question.id}`;
  const cppTab = `cpp-tab-${question.id}`;
  const pythonPanel = `python-panel-${question.id}`;
  const cppPanel = `cpp-panel-${question.id}`;
  return `<section class="code-workbench" data-code-tabs>
    <div class="code-toolbar">
      <div class="language-tabs" role="tablist" aria-label="Solution language">
        <button id="${pythonTab}" type="button" role="tab" aria-selected="true" aria-controls="${pythonPanel}" data-code-language="python">Python3</button>
        <button id="${cppTab}" type="button" role="tab" aria-selected="false" aria-controls="${cppPanel}" data-code-language="cpp" tabindex="-1">C++</button>
      </div>
      <button class="copy-code" type="button" data-copy-code>Copy code</button>
    </div>
    <div id="${pythonPanel}" class="code-panel" role="tabpanel" aria-labelledby="${pythonTab}" data-code-panel="python"><pre><code>${escapeHtml(solution.python)}</code></pre></div>
    <div id="${cppPanel}" class="code-panel" role="tabpanel" aria-labelledby="${cppTab}" data-code-panel="cpp" hidden><pre><code>${escapeHtml(solution.cpp)}</code></pre></div>
  </section>`;
}

const allQuestions = data.levels.flatMap(level => level.questions.map(question => ({ ...question, level })));

function sidebar(active) {
  const current = key => active === key ? ' aria-current="page"' : "";
  return `<nav class="book-tree" aria-label="Book contents">
    <a class="tree-home ${active === "home" ? "active" : ""}"${current("home")} href="index.html">Quest book overview</a>
    ${data.levels.map(level => `<details open>
      <summary><span>0${level.number}</span>${escapeHtml(level.shortTitle)}</summary>
      <a class="${active === level.id ? "active" : ""}"${current(level.id)} href="level-${level.number}.html">${escapeHtml(level.title)}</a>
      ${level.questions.map(question => `<div class="tree-quest-group">
        <a class="${active === question.slug ? "active" : ""}"${current(question.slug)} href="${question.slug}.html"><span>${question.id}</span>${escapeHtml(question.title)}</a>
        <a class="tree-subpage ${active === `${question.slug}-thinking` ? "active" : ""}"${current(`${question.slug}-thinking`)} href="${question.slug}-thinking.html"><span>↳</span>Flow of thinking</a>
        <a class="tree-subpage tree-solution ${active === `${question.slug}-solution` ? "active" : ""}"${current(`${question.slug}-solution`)} href="${question.slug}-solution.html"><span>↳</span>Editorial solution</a>
      </div>`).join("")}
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
  <dialog id="reader-search"><div class="search-field"><span>⌕</span><label class="sr-only" for="reader-search-input">Search the book</label><input id="reader-search-input" type="search" placeholder="Search ${data.levels.length + allQuestions.length * 3 + 1} pages…"><kbd>ESC</kbd></div><div id="reader-search-results"></div></dialog>
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
<p>This reader links to LeetCode for the original problem statements. Its reasoning, examples, diagrams, editorials, and implementations are independently written for this learning path. Premium quests remain marked.</p>`;

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
  const previousLevel = data.levels[levelIndex - 1];
  const previousLevelLastQuest = previousLevel?.questions.at(-1);
  const previous = levelIndex === 0 ? { href: "index.html", title: "Quest book overview" } : { href: `${previousLevelLastQuest.slug}-solution.html`, title: `${previousLevelLastQuest.title}: Solution` };
  const next = { href: `${level.questions[0].slug}.html`, title: level.questions[0].title };
  await writeFile(path.join(learn, `level-${level.number}.html`), page({ title: level.title, active: level.id, eyebrow: `Level 0${level.number} · ${level.eyebrow}`, body: levelBody, previous, next }), "utf8");
}

for (const [questionIndex, question] of allQuestions.entries()) {
  const urls = { global: `https://leetcode.com/problems/${question.slug}/`, china: `https://leetcode.cn/problems/${question.slug}/` };
  const body = `<h1>${escapeHtml(question.title)}</h1>
  <div class="quest-meta"><span>LC ${question.id}</span><span class="${question.difficulty.toLowerCase()}">${question.difficulty}</span><span>${escapeHtml(question.role)}</span>${question.premium ? "<span>Premium</span>" : ""}</div>
  <p class="lead">${escapeHtml(question.goal)}</p>
  <div class="source-buttons"><a href="${urls.global}" target="_blank" rel="noreferrer">Open on LeetCode ↗</a><a href="${urls.china}" target="_blank" rel="noreferrer">LeetCode 中国 ↗</a></div>
  <div class="quest-subpages">
    <a class="thinking-launch" href="${question.slug}-thinking.html"><span>GUIDED SUBPAGE</span><strong>Flow of Thinking →</strong><em>Input → atomic operations → optimization → data-structure decisions</em></a>
    <a class="thinking-launch solution-launch" href="${question.slug}-solution.html"><span>EDITORIAL SUBPAGE</span><strong>Read the Solution →</strong><em>Input/output analysis → diagram → proof → Python3 and C++</em></a>
  </div>
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
  <p>After solving, compare your representation, invariants, and operation costs with the original editorial and complete implementations on the solution subpage.</p>`;
  const previousQuestion = allQuestions[questionIndex - 1];
  const nextQuestion = allQuestions[questionIndex + 1];
  const startsLevel = !previousQuestion || previousQuestion.level.id !== question.level.id;
  const previous = startsLevel ? { href: `level-${question.level.number}.html`, title: question.level.title } : { href: `${previousQuestion.slug}-solution.html`, title: `${previousQuestion.title}: Solution` };
  const next = { href: `${question.slug}-thinking.html`, title: `${question.title}: Flow of Thinking` };
  await writeFile(path.join(learn, `${question.slug}.html`), page({ title: question.title, active: question.slug, eyebrow: `Level 0${question.level.number} · ${question.level.shortTitle}`, body, previous, next }), "utf8");

  const thought = thinking[String(question.id)];
  const thinkingBody = `<h1>Flow of Thinking</h1>
  <div class="quest-meta"><span>LC ${question.id}</span><span>${escapeHtml(question.title)}</span><span>${escapeHtml(question.pattern)}</span></div>
  <p class="lead">Derive the solution from the operation contract instead of guessing a familiar data structure.</p>
  <div class="thinking-flow" aria-label="Thinking stages"><span>INPUT</span><i>→</i><span>ATOMS</span><i>→</i><span>OPTIMIZE</span><i>→</i><span>DECIDE</span><i>→</i><span>COMBINE</span><i>→</i><span>SOLVE</span></div>
  <h2 id="input-contract">1. Start from the input contract</h2>
  <p>${escapeHtml(thought.input)}</p>
  <div class="thinking-prompt"><span>ASK FIRST</span><strong>Which calls change state, which only query it, and what cost must each call meet?</strong></div>
  <h2 id="atomic-operations">2. Decompose into the smallest operations</h2>
  <p>Ignore classes and code for a moment. The system only needs to perform these atomic actions:</p>
  <ol class="atom-list">${thought.atoms.map((atom, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(atom)}</strong></li>`).join("")}</ol>
  <h2 id="operation-optimization">3. Optimize every operation</h2>
  <p>Start with the simplest implementation, expose its bottleneck, then buy the required cost with one deliberate index or representation.</p>
  <div class="operation-table"><div class="operation-head"><span>OPERATION</span><span>NAÏVE COST</span><span>TARGET</span><span>DECISION</span></div>${thought.operations.map(operation => `<div class="operation-row"><strong>${escapeHtml(operation.operation)}</strong><span>${escapeHtml(operation.naive)}</span><span>${escapeHtml(operation.target)}</span><b>${escapeHtml(operation.decision)}</b></div>`).join("")}</div>
  <h2 id="structure-decisions">4. Decide the data structures</h2>
  <div class="decision-grid">${thought.operations.map((operation, index) => `<article><span>DECISION ${String(index + 1).padStart(2, "0")}</span><h3>${escapeHtml(operation.decision)}</h3><p>Chosen to make <strong>${escapeHtml(operation.operation)}</strong> meet ${escapeHtml(operation.target)} instead of ${escapeHtml(operation.naive)}.</p></article>`).join("")}</div>
  <h2 id="combined-architecture">5. Combine the decisions</h2>
  <p>A collection of fast structures is not yet a design. Define ownership and the invariants that keep every view synchronized.</p>
  <ol>${thought.combine.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
  <div class="architecture-card"><span>COMBINED STRUCTURE</span><strong>${escapeHtml(question.pattern)}</strong><p>${escapeHtml(question.goal)}</p></div>
  <h2 id="build-solution">6. Build the solution</h2>
  <ol class="solution-steps">${thought.solution.map((step, index) => `<li><span>STEP ${String(index + 1).padStart(2, "0")}</span><p>${escapeHtml(step)}</p></li>`).join("")}</ol>
  <h2 id="prove-complexity">7. Prove the operation budget</h2>
  <div class="complexity-list">${thought.complexity.map(item => `<code>${escapeHtml(item)}</code>`).join("")}</div>
  <div class="review-prompt"><span>FINAL CHECK</span><strong>${escapeHtml(question.checkpoint)}</strong></div>
  <p><a href="${question.slug}.html">← Return to the ${escapeHtml(question.title)} design page</a></p>`;
  const thinkingPrevious = { href: `${question.slug}.html`, title: question.title };
  const thinkingNext = { href: `${question.slug}-solution.html`, title: `${question.title}: Solution` };
  await writeFile(path.join(learn, `${question.slug}-thinking.html`), page({ title: `${question.title}: Flow of Thinking`, active: `${question.slug}-thinking`, eyebrow: `Level 0${question.level.number} · Guided reasoning`, body: thinkingBody, previous: thinkingPrevious, next: thinkingNext }), "utf8");

  const solution = solutions[String(question.id)];
  const solutionBody = `<h1>Editorial Solution</h1>
  <div class="quest-meta"><span>LC ${question.id}</span><span class="${question.difficulty.toLowerCase()}">${question.difficulty}</span><span>${escapeHtml(question.title)}</span><span>${escapeHtml(question.pattern)}</span></div>
  <p class="lead">${escapeHtml(solution.intuition)}</p>
  <div class="editorial-route" aria-label="Editorial sections"><span>CONTRACT</span><i>→</i><span>TRACE</span><i>→</i><span>MODEL</span><i>→</i><span>PROVE</span><i>→</i><span>CODE</span></div>
  <h2 id="input-output-analysis">1. Analyze the input and output</h2>
  <div class="contract-grid"><article><span>INPUT MODEL</span><p>${escapeHtml(solution.inputModel)}</p></article><article><span>OUTPUT MODEL</span><p>${escapeHtml(solution.outputModel)}</p></article></div>
  <div class="io-example"><div><span>EXAMPLE INPUT</span><pre><code>${escapeHtml(solution.example.input)}</code></pre></div><div><span>EXAMPLE OUTPUT</span><pre><code>${escapeHtml(solution.example.output)}</code></pre></div></div>
  <h2 id="example-trace">2. Trace the example</h2>
  <p>Follow each public call and make the state transition explicit before writing code.</p>
  <div class="trace-table"><div class="trace-head"><span>CALL</span><span>STATE AFTER CALL</span><span>RESULT</span></div>${solution.example.trace.map(step => `<div class="trace-row"><code>${escapeHtml(step.call)}</code><span>${escapeHtml(step.state)}</span><strong>${escapeHtml(step.result)}</strong></div>`).join("")}</div>
  <h2 id="intuition">3. Intuition</h2>
  <p>${escapeHtml(solution.intuition)}</p>
  <ol class="editorial-steps">${solution.approach.map((step, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><p>${escapeHtml(step)}</p></li>`).join("")}</ol>
  <h2 id="structure-diagram">4. Data-structure diagram</h2>
  ${structureDiagram(solution.diagram)}
  <h2 id="algorithm">5. Algorithm</h2>
  <ul>${solution.invariants.map(invariant => `<li>${escapeHtml(invariant)}</li>`).join("")}</ul>
  <pre class="pseudocode-block" aria-label="Pseudocode"><code>${escapeHtml(solution.pseudocode)}</code></pre>
  <h2 id="correctness-proof">6. Why the solution is correct</h2>
  <ol>${solution.proof.map(statement => `<li>${escapeHtml(statement)}</li>`).join("")}</ol>
  <h2 id="complexity-graph">7. Complexity graph</h2>
  <div class="complexity-chart" aria-label="Operation complexity graph">${solution.complexity.map(item => `<div class="complexity-row"><div><strong>${escapeHtml(item.operation)}</strong><code>${escapeHtml(item.time)}</code></div><span class="complexity-track"><i style="--cost-width:${complexityWidth(item.time)}%"></i></span><p>${escapeHtml(item.reason)}</p></div>`).join("")}</div>
  <p class="chart-note">Shorter bars represent a smaller asymptotic growth class; labels remain the source of truth when several variables are involved.</p>
  <h2 id="full-solution">8. Full solution</h2>
  <p>Switch languages without leaving the page. Each tab contains a complete submission using LeetCode's expected class and method names.</p>
  ${codeWorkbench(question, solution)}
  <div class="review-prompt"><span>FINAL REVIEW</span><strong>${escapeHtml(question.checkpoint)}</strong></div>
  <p><a href="${question.slug}-thinking.html">← Return to the guided thinking flow</a></p>`;
  const solutionPrevious = { href: `${question.slug}-thinking.html`, title: `${question.title}: Flow of Thinking` };
  const crossesLevel = nextQuestion && nextQuestion.level.id !== question.level.id;
  const solutionNext = !nextQuestion ? null : crossesLevel ? { href: `level-${nextQuestion.level.number}.html`, title: nextQuestion.level.title } : { href: `${nextQuestion.slug}.html`, title: nextQuestion.title };
  await writeFile(path.join(learn, `${question.slug}-solution.html`), page({ title: `${question.title}: Solution`, active: `${question.slug}-solution`, eyebrow: `Level 0${question.level.number} · Editorial`, body: solutionBody, previous: solutionPrevious, next: solutionNext }), "utf8");
}

const searchIndex = [
  { title: "Quest book overview", href: "index.html", section: "Overview", text: "learning route design loop source policy" },
  ...data.levels.map(level => ({ title: level.title, href: `level-${level.number}.html`, section: `Level 0${level.number}`, text: `${level.summary} ${level.foundation} ${level.invariants.join(" ")}` })),
  ...allQuestions.flatMap(question => [
    { title: question.title, href: `${question.slug}.html`, section: `LC ${question.id} · ${question.level.shortTitle}`, text: `${question.goal} ${question.pattern} ${question.checkpoint}` },
    { title: `${question.title}: Flow of Thinking`, href: `${question.slug}-thinking.html`, section: `LC ${question.id} · Guided reasoning`, text: `${thinking[String(question.id)].input} ${thinking[String(question.id)].atoms.join(" ")} ${thinking[String(question.id)].combine.join(" ")}` },
    { title: `${question.title}: Solution`, href: `${question.slug}-solution.html`, section: `LC ${question.id} · Editorial`, text: `${solutions[String(question.id)].inputModel} ${solutions[String(question.id)].intuition} ${solutions[String(question.id)].approach.join(" ")}` }
  ])
];
await writeFile(path.join(learn, "search-index.json"), JSON.stringify(searchIndex), "utf8");

await writeFile(path.join(dist, "index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0; url=./en/"><title>LeetCode Design Quest</title><link rel="canonical" href="./en/"></head><body><p><a href="./en/">Open the English atlas</a></p></body></html>`, "utf8");

console.log(`Built English atlas and reader (${data.levels.length + allQuestions.length * 3 + 1} reader pages) in dist/.`);
