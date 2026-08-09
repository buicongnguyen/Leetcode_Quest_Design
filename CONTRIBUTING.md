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

The checks reject duplicate IDs/slugs, incomplete thinking or solution coverage, invalid difficulties, missing editorial fields, malformed diagrams, undersized code submissions, and broken core UI contracts.
