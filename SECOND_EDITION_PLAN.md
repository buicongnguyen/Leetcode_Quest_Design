# Second-edition implementation plan

This plan converts the reader from a complete reference into an attempt-first, behaviorally verified self-study book. It was derived from the 2026-08-16 curriculum and code review.

## 1. Executable solution assurance

- [x] Define one language-neutral constructor and operation trace for every quest.
- [x] Execute all 26 Python submissions against expected, approximate, and nondeterministic results.
- [x] Generate and execute equivalent C++20 drivers in CI.
- [x] Require exact verification coverage whenever a quest is added or removed.
- [x] Keep generated test artifacts in a temporary directory and remove them after each run.

**Release gate:** GitHub Pages cannot deploy unless every Python trace passes and every C++ submission compiles and passes the same behavioral trace.

## 2. Attempt-first learning loop

- [x] Add `Not started`, `Attempted`, `Solved`, and `Reviewed` states to all three quest pages.
- [x] Persist state locally and synchronize solved/reviewed quests with atlas completion.
- [x] Add a three-stage hint ladder to every quest overview.
- [x] Keep hints collapsed so learners can reveal only the next needed design fact.
- [x] Explain the mastery standard on the reader home page.

**Release gate:** practice state must persist across overview, thinking, and solution pages and remain keyboard operable.

## 3. Interactive state traces

- [x] Convert every editorial trace into a step-by-step lab.
- [x] Support Previous, Next, Reset, Left Arrow, and Right Arrow.
- [x] Announce the current step through accessible live state.
- [x] Preserve the complete static trace behind a disclosure for scanning and printing.

**Release gate:** the lab must stop at both boundaries, reset to step one, and expose the same facts as the complete trace.

## 4. Access and advanced depth

- [x] Add an independently written API contract card for all seven Premium quests.
- [x] State operations and modeling assumptions without reproducing LeetCode statements.
- [x] Add adversarial traces to every Hard or Boss quest.
- [x] Add problem-specific Python and C++ implementation notes.
- [x] Add a production extension that changes one important constraint.

**Release gate:** Premium contract coverage must exactly match Premium quest metadata; advanced coverage must exactly match Hard/Boss metadata.

## 5. Chapter mastery

- [x] Add a three-row pattern decision comparison to every chapter.
- [x] Add three synthesis challenges with hidden rubrics to every chapter.
- [x] Preserve the original five requested chapter names while clarifying their broader design scope through comparisons and progression.
- [x] Index assessment prompts and pattern comparisons in reader search.

**Release gate:** each chapter assessment must test representation choice, invariants, failure behavior, and complexity rather than code recall.

## 6. Documentation and maintenance

- [x] Replace the stale before-state audit with a dated current-state review.
- [x] Document the edition and verification authoring schemas.
- [x] Update local requirements and CI expectations.
- [x] Complete final source review, browser interaction review, and clean-build verification.
- [x] Commit, push through SSH, and verify the GitHub Pages release.

## Definition of done

The second edition is complete when all 26 quest sets are behaviorally verified, all generated pages and links pass, every new practice interaction works with mouse and keyboard, the source review is clean, and the exact reviewed commit is live on GitHub Pages.
