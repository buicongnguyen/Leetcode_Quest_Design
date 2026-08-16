# Reading-density plan

**Reviewed:** 2026-08-16

**Scope:** atlas, reader home, five chapter pages, 26 quest overviews, 26 thinking pages, and 26 solution pages.

## Goal

Reduce unnecessary scrolling without making the book feel cramped. Compact repeated rows and containers more aggressively than continuous prose, keep clear separation between major sections, and preserve accessible controls.

## Density rules

1. Keep primary navigation and interactive controls at least 36–48 px high where they are used as touch targets.
2. Reduce large section gaps before reducing paragraph line height.
3. Keep body prose between 1.55 and 1.65 line height; use tighter leading only for labels, tables, diagrams, and code.
4. Reduce repeated card, table, list, sidebar, and outline padding by roughly 15–30%.
5. Preserve stronger spacing around page titles, major diagrams, code workbenches, and page-to-page navigation.
6. Use the same compact rules across generated pages so no chapter or quest silently returns to the old spacing.

## Implementation checklist

- [x] Inventory the atlas, sidebars, outlines, headings, prose, cards, tables, lists, disclosures, diagrams, traces, code blocks, and responsive rules.
- [x] Compact reader page padding and major section spacing.
- [x] Compact repeated sidebar and outline rows.
- [x] Compact chapter, overview, thinking, and editorial card grids.
- [x] Compact operation, trace, comparison, progression, protocol, and assessment rows.
- [x] Compact diagrams, complexity rows, and code-block leading without reducing code size.
- [x] Compact atlas hero, learning loop, chapter accordion, quest cards, principles, dialogs, and footer.
- [x] Add mobile-specific density rules while preserving the single-column reading flow.
- [x] Rebuild and measure representative pages against the baseline.
- [x] Verify all generated pages, links, interactions, and browser diagnostics.
- [x] Complete source review, commit, push through SSH, and verify GitHub Pages.

## Baseline measurements

At a 720 px-high desktop viewport before the density pass:

| Surface | Document height |
| --- | ---: |
| Atlas | 4,224 px |
| Reader home | 2,389 px |
| Chapter 1 | 3,454 px |
| LRU overview | 2,772 px |
| LRU thinking page | 3,949 px |
| LRU solution | 5,606 px |

## Results

| Surface | Compact height | Reduction |
| --- | ---: | ---: |
| Atlas | 3,348 px | 21% |
| Reader home | 2,072 px | 13% |
| Chapter 1 | 2,835 px | 18% |
| LRU overview | 2,248 px | 19% |
| LRU thinking page | 3,233 px | 18% |
| LRU solution | 4,767 px | 15% |

All 84 reader documents were opened in the local browser at desktop width. None had missing primary content or horizontal document overflow. Representative atlas, chapter, overview, thinking, and solution interactions remained functional, and browser diagnostics reported no warnings or errors.
