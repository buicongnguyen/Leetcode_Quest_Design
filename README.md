<p align="center">
  <strong>LEETCODE QUEST</strong><br>
  <sub>System & Software Design</sub>
</p>

<p align="center">
  A visual quest map for learning how small object APIs hide state machines, indexes, invariants, and operation budgets.
</p>

<p align="center">
  <a href="https://buicongnguyen.github.io/Leetcode_Quest_Design/en/"><strong>Open the English atlas</strong></a>
  ·
  <a href="https://buicongnguyen.github.io/Leetcode_Quest_Design/en/learn/"><strong>Read the quest book</strong></a>
  ·
  <a href="https://leetcode.com/problemset/"><strong>LeetCode Global</strong></a>
  ·
  <a href="https://leetcode.cn/problemset/"><strong>LeetCode China</strong></a>
  ·
  <a href="#run-locally"><strong>Run locally</strong></a>
</p>

## The learning path

The repository organizes LeetCode design problems into a deliberate five-level progression:

1. **Cache System Design Base** — bounded state, recency, frequency, eviction, lazy iteration, and hierarchy.
2. **Data Flow Processing Center** — rolling windows, timestamps, counters, cleanup, and correction.
3. **Data Structure Design Workshop** — ring buffers, hash tables, dense indexes, and probabilistic layers.
4. **Business System Simulation Platform** — domain entities, validation, transactions, and legal state transitions.
5. **Comprehensive Data Operation Simulation Station** — canonical records synchronized with multiple query indexes.

Every level repeats the same design method: identify the authoritative state, write invariants, select indexes from the required operation costs, and test failure paths before coding.

## Included in the first release

- 26 curated LeetCode quests with Global and China links.
- An English atlas at `/en/` and a full nested book reader at `/en/learn/`.
- One generated reader page for every level and every quest, with a persistent chapter tree.
- Chapter guides with prerequisites, measurable outcomes, quest progression, recurring failure modes, a practice protocol, and a bridge to the next stage.
- A problem-specific **Flow of Thinking** child page for every quest, deriving the solution from input operations, bottlenecks, data-structure decisions, combined architecture, and complexity proof.
- A learning contract, edge-case lab, wrong-turn review, alternative-design tradeoff, and pre-code test plan for every quest.
- An original **Editorial Solution** child page for every quest, with input/output analysis, an example trace, data-structure diagram, complexity graph, pseudocode, proof, and complete Python3/C++ tabs.
- Difficulty and Premium filters.
- Search by problem, level, or design pattern.
- Detailed design goals and review checkpoints without reproducing LeetCode problem statements or editorials.
- Local progress saved in the browser.
- Responsive light/dark interface.
- Automated static checks and GitHub Pages deployment.

## Run locally

Node.js 20 or newer is required.

```bash
npm run check
npm start
```

Open `http://127.0.0.1:4173`.

## Publish with GitHub Pages

Push the repository to GitHub with `main` as the default branch, then select **GitHub Actions** as the Pages source in the repository settings. The included workflow validates, builds, and publishes `dist/`.

## Content policy

This project contains original summaries, learning goals, explanations, diagrams, examples, and implementations. It links to LeetCode for the actual problem statements and does not republish them or LeetCode's editorials. Some linked problems require LeetCode Premium. LeetCode is a trademark of LeetCode LLC; this independent project is not affiliated with or endorsed by LeetCode.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the quest-entry schema and review checklist.

The generated route structure and content architecture are documented in [SITE.md](SITE.md).

The chapter-by-chapter and quest-by-quest evaluation is documented in [CONTENT_AUDIT.md](CONTENT_AUDIT.md).

## License

The original code and prose in this repository are available under the MIT License. Linked problem statements and third-party trademarks are not part of that license.
