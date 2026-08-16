import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import level12Solutions from "../data/solutions/levels-1-2.mjs";
import level34Solutions from "../data/solutions/levels-3-4.mjs";
import level5Solutions from "../data/solutions/level-5.mjs";
import guides from "../data/guides.mjs";
import edition from "../data/edition.mjs";
import verification from "../data/verification.mjs";

const root = path.resolve(import.meta.dirname, "..");
const data = JSON.parse(await readFile(path.join(root, "data", "quests.json"), "utf8"));
const thinking = JSON.parse(await readFile(path.join(root, "data", "thinking.json"), "utf8"));
const solutions = { ...level12Solutions, ...level34Solutions, ...level5Solutions };
const html = await readFile(path.join(root, "site", "index.html"), "utf8");
const css = await readFile(path.join(root, "site", "styles.css"), "utf8");
const js = await readFile(path.join(root, "site", "app.js"), "utf8");
const bookCss = await readFile(path.join(root, "reader", "book.css"), "utf8");
const bookJs = await readFile(path.join(root, "reader", "book.js"), "utf8");

assert.equal(data.levels.length, 5, "The roadmap must contain five levels");
assert.deepEqual(data.levels.map(level => level.number), [1, 2, 3, 4, 5], "Level numbers must be sequential");
const questions = data.levels.flatMap(level => level.questions);
const interfaces = {
  146: ["LRUCache", "get", "put"], 460: ["LFUCache", "get", "put"],
  588: ["FileSystem", "ls", "mkdir", "addContentToFile", "readContentFromFile"], 604: ["StringIterator", "next", "hasNext"],
  1756: ["MRUQueue", "fetch"], 346: ["MovingAverage", "next"], 359: ["Logger", "shouldPrintMessage"],
  362: ["HitCounter", "hit", "getHits"], 933: ["RecentCounter", "ping"], 2034: ["StockPrice", "update", "current", "maximum", "minimum"],
  622: ["MyCircularQueue", "enQueue", "deQueue", "Front", "Rear", "isEmpty", "isFull"], 705: ["MyHashSet", "add", "remove", "contains"],
  706: ["MyHashMap", "put", "get", "remove"], 380: ["RandomizedSet", "insert", "remove", "getRandom"], 1206: ["Skiplist", "search", "add", "erase"],
  1603: ["ParkingSystem", "addCar"], 1396: ["UndergroundSystem", "checkIn", "checkOut", "getAverageTime"],
  1797: ["AuthenticationManager", "generate", "renew", "countUnexpiredTokens"], 2043: ["Bank", "transfer", "deposit", "withdraw"],
  2241: ["ATM", "deposit", "withdraw"], 355: ["Twitter", "postTweet", "getNewsFeed", "follow", "unfollow"],
  1500: ["FileSharing", "join", "leave", "request"], 1912: ["MovieRentingSystem", "search", "rent", "drop", "report"],
  2296: ["TextEditor", "addText", "deleteText", "cursorLeft", "cursorRight"], 3484: ["Spreadsheet", "setCell", "resetCell", "getValue"],
  432: ["AllOne", "inc", "dec", "getMaxKey", "getMinKey"]
};
assert.ok(questions.length >= 25, "The foundation map must include at least 25 quests");
assert.equal(new Set(questions.map(question => question.id)).size, questions.length, "LeetCode IDs must be unique");
assert.equal(new Set(questions.map(question => question.slug)).size, questions.length, "LeetCode slugs must be unique");
assert.deepEqual(Object.keys(thinking).map(Number).sort((a, b) => a - b), questions.map(question => question.id).sort((a, b) => a - b), "Every quest must have exactly one thinking flow");
assert.deepEqual(Object.keys(solutions).map(Number).sort((a, b) => a - b), questions.map(question => question.id).sort((a, b) => a - b), "Every quest must have exactly one editorial solution");
assert.deepEqual(Object.keys(guides.chapters).map(Number).sort((a, b) => a - b), data.levels.map(level => level.number), "Every chapter must have exactly one teaching guide");
assert.deepEqual(Object.keys(guides.quests).map(Number).sort((a, b) => a - b), questions.map(question => question.id).sort((a, b) => a - b), "Every quest must have exactly one learning guide");
assert.deepEqual(Object.keys(edition.chapters).map(Number).sort((a, b) => a - b), data.levels.map(level => level.number), "Every chapter must have one second-edition practice guide");
assert.deepEqual(Object.keys(verification).map(Number).sort((a, b) => a - b), questions.map(question => question.id).sort((a, b) => a - b), "Every quest must have exactly one executable verification trace");
assert.deepEqual(Object.keys(edition.premiumContracts).map(Number).sort((a, b) => a - b), questions.filter(question => question.premium).map(question => question.id).sort((a, b) => a - b), "Every Premium quest must have an independent contract card");
assert.deepEqual(Object.keys(edition.advanced).map(Number).sort((a, b) => a - b), questions.filter(question => question.difficulty === "Hard" || question.role.includes("Boss")).map(question => question.id).sort((a, b) => a - b), "Every Hard or Boss quest must have an advanced review");
for (const level of data.levels) {
  assert.ok(level.title && level.summary && level.foundation, `${level.id} is missing learning context`);
  assert.ok(level.invariants.length >= 3, `${level.id} needs at least three invariants`);
  const guide = guides.chapters[String(level.number)];
  assert.ok(guide.prerequisites.length >= 3 && guide.outcomes.length >= 4, `${level.id} needs prerequisites and measurable outcomes`);
  assert.ok(guide.failureModes.length >= 3 && guide.practiceProtocol.length >= 4 && guide.bridge, `${level.id} needs failure modes, practice protocol, and a bridge`);
  assert.deepEqual(guide.progression.map(item => item.id), level.questions.map(question => question.id), `${level.id} progression must cover quests in exact chapter order`);
  assert.ok(guide.progression.every(item => item.lesson), `${level.id} progression needs a lesson for every quest`);
  const editionChapter = edition.chapters[String(level.number)];
  assert.ok(editionChapter.comparison.length >= 3 && editionChapter.comparison.every(row => row.decision && row.choose && row.avoid), `${level.id} needs a complete pattern comparison`);
  assert.ok(editionChapter.assessment.length >= 3 && editionChapter.assessment.every(item => item.prompt && item.rubric.length >= 3), `${level.id} needs a three-part chapter assessment`);
}
for (const question of questions) {
  assert.ok(Number.isInteger(question.id) && question.id > 0, "Quest ID must be a positive integer");
  assert.match(question.slug, /^[a-z0-9-]+$/, `${question.id} has an invalid slug`);
  assert.ok(["Easy", "Medium", "Hard"].includes(question.difficulty), `${question.id} has an invalid difficulty`);
  for (const key of ["title", "role", "pattern", "goal", "checkpoint"]) assert.ok(question[key], `${question.id} is missing ${key}`);
}
for (const [id, flow] of Object.entries(thinking)) {
  assert.ok(flow.input && flow.atoms.length >= 3 && flow.operations.length >= 2, `Thinking flow ${id} is missing decomposition content`);
  assert.ok(flow.operations.every(item => item.operation && item.naive && item.target && item.decision), `Thinking flow ${id} has an incomplete optimization row`);
  assert.ok(flow.combine.length >= 3 && flow.solution.length >= 3 && flow.complexity.length >= 2, `Thinking flow ${id} is missing architecture, solution, or complexity proof`);
}
for (const [id, solution] of Object.entries(solutions)) {
  for (const key of ["inputModel", "outputModel", "intuition", "pseudocode", "python", "cpp"]) assert.ok(typeof solution[key] === "string" && solution[key].trim().length, `Solution ${id} is missing ${key}`);
  assert.ok(solution.example?.input && solution.example?.output && solution.example.trace?.length >= 3, `Solution ${id} needs input, output, and a three-step trace`);
  assert.ok(solution.example.trace.every(step => step.call && step.state && step.result), `Solution ${id} has an incomplete example trace`);
  assert.ok(solution.approach?.length >= 3 && solution.invariants?.length >= 2 && solution.proof?.length >= 2, `Solution ${id} is missing editorial reasoning`);
  assert.ok(solution.complexity?.length >= 2 && solution.complexity.every(item => item.operation && item.time && item.reason), `Solution ${id} has an incomplete complexity graph`);
  assert.ok(solution.diagram?.caption && solution.diagram.nodes?.length >= 2 && solution.diagram.edges?.length >= 1, `Solution ${id} needs a data-structure diagram`);
  const nodeIds = new Set(solution.diagram.nodes.map(node => node.id));
  assert.equal(nodeIds.size, solution.diagram.nodes.length, `Solution ${id} diagram node IDs must be unique`);
  assert.ok(solution.diagram.nodes.every(node => node.id && node.label), `Solution ${id} has an incomplete diagram node`);
  assert.ok(solution.diagram.edges.every(edge => nodeIds.has(edge.from) && nodeIds.has(edge.to) && edge.label), `Solution ${id} has an invalid diagram edge`);
  for (const language of ["python", "cpp"]) {
    assert.ok(solution[language].length >= 120 && solution[language].includes("class "), `Solution ${id} ${language} code is too short or lacks a class`);
    assert.ok(!solution[language].includes("```"), `Solution ${id} ${language} code must not contain Markdown fences`);
    for (const apiName of interfaces[id]) assert.ok(solution[language].includes(apiName), `Solution ${id} ${language} code is missing LeetCode interface name ${apiName}`);
  }
}
for (const [id, guide] of Object.entries(guides.quests)) {
  assert.ok(guide.placement && guide.prerequisites.length >= 2 && guide.outcomes.length >= 3, `Quest guide ${id} is missing placement, prerequisites, or outcomes`);
  assert.ok(guide.edgeCases.length >= 3 && guide.mistakes.length >= 3, `Quest guide ${id} needs problem-specific edge cases and mistakes`);
  assert.ok(guide.alternative?.name && guide.alternative?.useWhen && guide.alternative?.tradeoff, `Quest guide ${id} needs an alternative-design tradeoff`);
  assert.ok(guide.tests.length >= 3 && guide.tests.every(test => test.name && test.scenario && test.expectation), `Quest guide ${id} needs a complete pre-code test plan`);
  assert.ok(guide.followUps.length >= 2, `Quest guide ${id} needs interview follow-ups`);
}
for (const [id, spec] of Object.entries(verification)) {
  assert.equal(spec.className, interfaces[id][0], `Verification ${id} uses the wrong class name`);
  assert.equal(spec.constructor.types.length, spec.constructor.args.length, `Verification ${id} constructor types and arguments differ`);
  assert.ok(spec.calls.length >= 5, `Verification ${id} needs a meaningful behavioral trace`);
  for (const entry of spec.calls) {
    const method = spec.methods[entry.method];
    assert.ok(method, `Verification ${id} calls unknown method ${entry.method}`);
    assert.equal(method.types.length, entry.args.length, `Verification ${id} has a type mismatch for ${entry.method}`);
  }
}
for (const file of ["index.html", "styles.css", "app.js"]) await access(path.join(root, "site", file));
for (const required of ["Skip to quest map", "aria-live=", "quest-dialog", "search-dialog", "theme-toggle", "dialog-outcome", "dialog-edge-case"]) assert.ok(html.includes(required), `Missing accessible UI contract: ${required}`);
assert.ok(html.includes('id="premium-toggle" type="checkbox" checked'), "All quests, including Premium quests, must be visible on first load");
for (const atlasNavigation of ["atlas-sidebar", "atlas-tree", "ATLAS CONTENTS"]) assert.ok(html.includes(atlasNavigation), `Missing atlas contents navigation: ${atlasNavigation}`);
assert.ok(css.includes("@media (max-width: 680px)"), "Mobile layout is missing");
assert.ok(css.includes("prefers-reduced-motion"), "Reduced-motion support is missing");
for (const behavior of ["localStorage", "showModal", "data-difficulty", "leetcode.cn/problems", "leetcode.com/problems", "guides.json", "guide.outcomes", "guide.edgeCases", "includePremium: true"]) assert.ok(js.includes(behavior), `Missing interaction: ${behavior}`);
for (const readerBehavior of ["IntersectionObserver", "search-index.json", "reader-menu", "localStorage", "sessionStorage", "SIDEBAR_SCROLL_KEY", "readerSidebar.scrollTop", "CODE_LANGUAGE_KEY", "data-code-tabs", "ArrowRight", "data-copy-code", "PRACTICE_STATE_KEY", "setupPracticeStatuses", "setupTraceLabs"]) assert.ok(bookJs.includes(readerBehavior), `Missing reader interaction: ${readerBehavior}`);
assert.ok(bookCss.includes(".book-tree"), "Nested reader tree is missing");
for (const solutionStyle of [".tree-subpage", ".structure-graph", ".complexity-chart", ".code-workbench", ".language-tabs", ".prerequisite-grid", ".learning-contract", ".wrong-turn-grid", ".test-plan", ".followup-grid", ".practice-status", ".trace-lab", ".premium-contract", ".chapter-assessment", ".language-review"]) assert.ok(bookCss.includes(solutionStyle), `Missing enriched reader style: ${solutionStyle}`);
assert.ok(bookCss.includes("grid-template-columns:280px minmax(0,1fr) 240px"), "Reader columns must span from the left edge to the right edge");
const buildScript = await readFile(path.join(root, "scripts", "build-site.mjs"), "utf8");
for (const readerRoute of ["en", "learn", "level-${level.number}.html", "search-index.json"]) assert.ok(buildScript.includes(readerRoute), `Reader build route is missing: ${readerRoute}`);
for (const thinkingContract of ["thinking.json", "-thinking.html", "Flow of Thinking", "operation-table"]) assert.ok(buildScript.includes(thinkingContract), `Thinking-page build contract is missing: ${thinkingContract}`);
for (const solutionContract of ["level-5.mjs", "-solution.html", "Editorial Solution", "structureDiagram", "codeWorkbench", "role=\"tab\"", "aria-current=\"page\""]) assert.ok(buildScript.includes(solutionContract), `Solution-page build contract is missing: ${solutionContract}`);
for (const guideContract of ["guides.mjs", "three-page learning cycle", "Before this chapter", "Learning contract", "Reject the common wrong turns", "Write tests before code", "Interview follow-ups"]) assert.ok(buildScript.includes(guideContract), `Enriched content contract is missing: ${guideContract}`);
for (const editionContract of ["edition.mjs", "practiceStatus", "hintLadder", "traceLab", "premiumContract", "advancedReview", "chapterPractice"]) assert.ok(buildScript.includes(editionContract), `Second-edition build contract is missing: ${editionContract}`);
for (const atlasSolutionLink of ["dialog-overview", "dialog-thinking", "dialog-solution", "-solution.html"]) assert.ok(html.includes(atlasSolutionLink) || js.includes(atlasSolutionLink), `Atlas is missing solution navigation: ${atlasSolutionLink}`);

const dist = path.join(root, "dist");
const reader = path.join(dist, "en", "learn");
const expectedReaderFiles = [
  "index.html",
  ...data.levels.map(level => `level-${level.number}.html`),
  ...questions.flatMap(question => [
    `${question.slug}.html`,
    `${question.slug}-thinking.html`,
    `${question.slug}-solution.html`
  ])
];
assert.equal(expectedReaderFiles.length, 84, "The reader must contain 84 indexed learning pages");
for (const file of expectedReaderFiles) await access(path.join(reader, file));

const searchIndex = JSON.parse(await readFile(path.join(reader, "search-index.json"), "utf8"));
assert.equal(searchIndex.length, expectedReaderFiles.length, "Search must index every reader page exactly once");
assert.equal(new Set(searchIndex.map(entry => entry.href)).size, searchIndex.length, "Search-index routes must be unique");
assert.deepEqual(searchIndex.map(entry => entry.href).sort(), expectedReaderFiles.toSorted(), "Search-index coverage must match the generated reader");
assert.ok(searchIndex.every(entry => entry.title && entry.section && entry.text), "Every search entry needs a title, section, and searchable content");

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(target));
    else if (entry.name.endsWith(".html")) files.push(target);
  }
  return files;
}

const brokenLinks = [];
const generatedHtml = await htmlFiles(dist);
for (const file of generatedHtml) {
  const document = await readFile(file, "utf8");
  for (const match of document.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const raw = match[1];
    const localUrl = raw.split(/[?#]/, 1)[0];
    if (!localUrl || /^(?:https?:|mailto:|data:|javascript:)/.test(localUrl)) continue;
    let target;
    if (localUrl.startsWith("/Leetcode_Quest_Design/")) target = path.join(dist, localUrl.slice("/Leetcode_Quest_Design/".length));
    else if (localUrl.startsWith("/")) {
      brokenLinks.push(`${path.relative(dist, file)} -> ${localUrl} (invalid Pages-root route)`);
      continue;
    } else target = path.resolve(path.dirname(file), localUrl);
    if (!target.startsWith(dist)) {
      brokenLinks.push(`${path.relative(dist, file)} -> ${localUrl} (escapes dist)`);
      continue;
    }
    try {
      const targetStat = await stat(target);
      if (targetStat.isDirectory()) await access(path.join(target, "index.html"));
    } catch {
      brokenLinks.push(`${path.relative(dist, file)} -> ${localUrl}`);
    }
  }
}
assert.deepEqual(brokenLinks, [], `Generated site has broken local links:\n${brokenLinks.join("\n")}`);

console.log(`Checks passed: ${data.levels.length} enriched chapters, ${questions.length} complete quest learning sets, ${expectedReaderFiles.length} search entries, and ${generatedHtml.length} linked HTML pages.`);
