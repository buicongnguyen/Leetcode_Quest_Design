import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import level12Solutions from "../data/solutions/levels-1-2.mjs";
import level34Solutions from "../data/solutions/levels-3-4.mjs";
import level5Solutions from "../data/solutions/level-5.mjs";

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
for (const level of data.levels) {
  assert.ok(level.title && level.summary && level.foundation, `${level.id} is missing learning context`);
  assert.ok(level.invariants.length >= 3, `${level.id} needs at least three invariants`);
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
for (const file of ["index.html", "styles.css", "app.js"]) await access(path.join(root, "site", file));
for (const required of ["Skip to quest map", "aria-live=", "quest-dialog", "search-dialog", "theme-toggle"]) assert.ok(html.includes(required), `Missing accessible UI contract: ${required}`);
for (const atlasNavigation of ["atlas-sidebar", "atlas-tree", "ATLAS CONTENTS"]) assert.ok(html.includes(atlasNavigation), `Missing atlas contents navigation: ${atlasNavigation}`);
assert.ok(css.includes("@media (max-width: 680px)"), "Mobile layout is missing");
assert.ok(css.includes("prefers-reduced-motion"), "Reduced-motion support is missing");
for (const behavior of ["localStorage", "showModal", "data-difficulty", "leetcode.cn/problems", "leetcode.com/problems"]) assert.ok(js.includes(behavior), `Missing interaction: ${behavior}`);
for (const readerBehavior of ["IntersectionObserver", "search-index.json", "reader-menu", "localStorage", "sessionStorage", "SIDEBAR_SCROLL_KEY", "readerSidebar.scrollTop", "CODE_LANGUAGE_KEY", "data-code-tabs", "ArrowRight", "data-copy-code"]) assert.ok(bookJs.includes(readerBehavior), `Missing reader interaction: ${readerBehavior}`);
assert.ok(bookCss.includes(".book-tree"), "Nested reader tree is missing");
for (const solutionStyle of [".tree-subpage", ".structure-graph", ".complexity-chart", ".code-workbench", ".language-tabs"]) assert.ok(bookCss.includes(solutionStyle), `Missing solution-page style: ${solutionStyle}`);
assert.ok(bookCss.includes("grid-template-columns:280px minmax(0,1fr) 240px"), "Reader columns must span from the left edge to the right edge");
const buildScript = await readFile(path.join(root, "scripts", "build-site.mjs"), "utf8");
for (const readerRoute of ["en", "learn", "level-${level.number}.html", "search-index.json"]) assert.ok(buildScript.includes(readerRoute), `Reader build route is missing: ${readerRoute}`);
for (const thinkingContract of ["thinking.json", "-thinking.html", "Flow of Thinking", "operation-table"]) assert.ok(buildScript.includes(thinkingContract), `Thinking-page build contract is missing: ${thinkingContract}`);
for (const solutionContract of ["level-5.mjs", "-solution.html", "Editorial Solution", "structureDiagram", "codeWorkbench", "role=\"tab\"", "aria-current=\"page\""]) assert.ok(buildScript.includes(solutionContract), `Solution-page build contract is missing: ${solutionContract}`);
for (const atlasSolutionLink of ["dialog-overview", "dialog-thinking", "dialog-solution", "-solution.html"]) assert.ok(html.includes(atlasSolutionLink) || js.includes(atlasSolutionLink), `Atlas is missing solution navigation: ${atlasSolutionLink}`);

console.log(`Static checks passed: ${data.levels.length} levels, ${questions.length} quests, thinking flows, and bilingual editorials.`);
