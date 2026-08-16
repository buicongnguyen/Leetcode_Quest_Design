# Site architecture

The site follows the atlas-plus-reader shape of the nearby Hello Algo project.

```text
/
└── en/
    ├── index.html                 interactive quest atlas
    └── learn/
        ├── index.html             book overview
        ├── level-1.html           level introduction
        ├── …
        ├── level-5.html
        ├── lru-cache.html         one article per quest
        ├── lru-cache-thinking.html
        ├── lru-cache-solution.html
        ├── …
        └── search-index.json      reader-wide search catalog
```

## Authoring model

`data/quests.json` stores the five-level hierarchy and quest metadata, `data/guides.mjs` stores the chapter teaching guides and per-quest practice layer, `data/thinking.json` stores guided derivations, and the modules in `data/solutions/` store original editorials plus Python3/C++ submissions. `data/edition.mjs` stores chapter assessments, pattern comparisons, Premium contracts, and advanced reviews. `data/verification.mjs` stores language-neutral behavioral traces that are executed against both solution languages. The build creates:

- the English atlas at `/en/`;
- the book overview and persistent chapter tree at `/en/learn/`;
- five enriched level introductions with prerequisites, outcomes, progression, failure modes, and practice protocols;
- one design-review article, one thinking flow, and one editorial solution for each quest;
- persistent attempt/solve/review controls, staged hints, and an interactive trace on each quest cycle;
- independent Premium contract cards and advanced Hard/Boss reviews where required;
- chapter comparison tables and synthesis assessments;
- previous/next navigation and a reader-wide search index;
- a root redirect to `/en/`.

This keeps navigation and titles synchronized: a quest is added once and appears in the atlas, chapter tree, reader search, level page, and its own article. Exact schema checks ensure that Premium, Hard/Boss, search, and behavioral-test coverage cannot silently drift from quest metadata.

## Local build

```bash
npm run check
npm run build
npm start
```

The output is a dependency-free static site in `dist/`. All URLs are relative, so the same build works under the GitHub Pages project path `https://buicongnguyen.github.io/Leetcode_Quest_Design/`.

## GitHub Pages

`.github/workflows/pages.yml` validates and builds the site on `main`, uploads `dist/`, and deploys it with GitHub's official Pages actions. `.github/workflows/ci.yml` runs the same validation for branches and pull requests.
