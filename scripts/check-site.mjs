import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const data = JSON.parse(await readFile(path.join(root, "data", "quests.json"), "utf8"));
const html = await readFile(path.join(root, "site", "index.html"), "utf8");
const css = await readFile(path.join(root, "site", "styles.css"), "utf8");
const js = await readFile(path.join(root, "site", "app.js"), "utf8");
const bookCss = await readFile(path.join(root, "reader", "book.css"), "utf8");
const bookJs = await readFile(path.join(root, "reader", "book.js"), "utf8");

assert.equal(data.levels.length, 5, "The roadmap must contain five levels");
assert.deepEqual(data.levels.map(level => level.number), [1, 2, 3, 4, 5], "Level numbers must be sequential");
const questions = data.levels.flatMap(level => level.questions);
assert.ok(questions.length >= 25, "The foundation map must include at least 25 quests");
assert.equal(new Set(questions.map(question => question.id)).size, questions.length, "LeetCode IDs must be unique");
assert.equal(new Set(questions.map(question => question.slug)).size, questions.length, "LeetCode slugs must be unique");
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
for (const file of ["index.html", "styles.css", "app.js"]) await access(path.join(root, "site", file));
for (const required of ["Skip to quest map", "aria-live=", "quest-dialog", "search-dialog", "theme-toggle"]) assert.ok(html.includes(required), `Missing accessible UI contract: ${required}`);
for (const atlasNavigation of ["atlas-sidebar", "atlas-tree", "ATLAS CONTENTS"]) assert.ok(html.includes(atlasNavigation), `Missing atlas contents navigation: ${atlasNavigation}`);
assert.ok(css.includes("@media (max-width: 680px)"), "Mobile layout is missing");
assert.ok(css.includes("prefers-reduced-motion"), "Reduced-motion support is missing");
for (const behavior of ["localStorage", "showModal", "data-difficulty", "leetcode.cn/problems", "leetcode.com/problems"]) assert.ok(js.includes(behavior), `Missing interaction: ${behavior}`);
for (const readerBehavior of ["IntersectionObserver", "search-index.json", "reader-menu", "localStorage", "sessionStorage", "SIDEBAR_SCROLL_KEY", "readerSidebar.scrollTop"]) assert.ok(bookJs.includes(readerBehavior), `Missing reader interaction: ${readerBehavior}`);
assert.ok(bookCss.includes(".book-tree"), "Nested reader tree is missing");
assert.ok(bookCss.includes("grid-template-columns:280px minmax(0,1fr) 240px"), "Reader columns must span from the left edge to the right edge");
const buildScript = await readFile(path.join(root, "scripts", "build-site.mjs"), "utf8");
for (const readerRoute of ["en", "learn", "level-${level.number}.html", "search-index.json"]) assert.ok(buildScript.includes(readerRoute), `Reader build route is missing: ${readerRoute}`);

console.log(`Static checks passed: ${data.levels.length} levels, ${questions.length} quests, unique IDs and slugs.`);
