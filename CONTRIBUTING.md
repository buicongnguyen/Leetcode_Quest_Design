# Contributing

Contributions should strengthen the learning path, not simply grow a list of links.

## Add or move a quest

Edit `data/quests.json`. Each quest needs:

- the canonical LeetCode numeric ID and URL slug;
- title, difficulty, and Premium status;
- a role in the level (`Foundation`, `Core`, `Checkpoint`, `Boss`, or `Related`);
- a one-sentence design goal;
- the primary data-structure or state-management pattern;
- a review question that tests an invariant or tradeoff.

Do not copy a problem statement, example, editorial, company tag, or solution from LeetCode. Link to the canonical page instead. Original explanations, traces, diagrams, and implementations belong in the matching module under `data/solutions/` and must use the exact LeetCode class/method interface.

Every quest also needs a complete entry in `data/guides.mjs`: chapter placement, prerequisites, measurable outcomes, edge cases, common mistakes, one alternative with a use case and tradeoff, three pre-code tests, and at least two interview follow-ups. Chapter guides in the same file must cover prerequisites, outcomes, quest progression, recurring failure modes, practice protocol, and the bridge to the next stage.

`data/verification.mjs` must contain a constructor and behavioral operation trace for the quest. The trace is executed directly against both submitted languages. Use `approx(value)` for floating-point output and `oneOf(...)` only when the API explicitly permits nondeterministic output.

`data/edition.mjs` owns the attempt-first teaching extensions:

- every chapter needs three pattern-comparison decisions and three assessment prompts with rubrics;
- every Premium quest needs an independently worded contract card;
- every Hard or Boss quest needs an adversarial trace, Python note, C++ note, and production extension.

## Choose the right level

- **Level 1:** eviction, cache-like ordering, bounded ownership, or lazy state.
- **Level 2:** streams, time windows, rolling aggregates, expiry, or correction.
- **Level 3:** implementing a reusable data structure from primitive storage.
- **Level 4:** business entities and commands with explicit validation or transaction behavior.
- **Level 5:** several synchronized indexes or subsystems with one canonical source of truth.

## Validate

```bash
npm run check
npm run build
```

The checks reject duplicate IDs/slugs, incomplete chapter/quest/edition coverage, missing behavioral traces, invalid difficulties, missing editorial fields, malformed diagrams, undersized code submissions, broken links, incomplete search coverage, and broken core UI contracts. Python behavior runs locally; CI additionally requires C++20 compilation and execution for every quest.
