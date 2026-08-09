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
        ├── …
        └── search-index.json      reader-wide search catalog
```

## Authoring model

`data/quests.json` is the canonical source for the first release. It stores the five-level hierarchy, level summaries and invariants, and quest metadata. The build creates:

- the English atlas at `/en/`;
- the book overview and persistent chapter tree at `/en/learn/`;
- five level introductions;
- one dedicated design-review article for each quest;
- previous/next navigation and a reader-wide search index;
- a root redirect to `/en/`.

This keeps navigation and titles synchronized: a quest is added once and appears in the atlas, chapter tree, reader search, level page, and its own article.

## Local build

```bash
npm run check
npm run build
npm start
```

The output is a dependency-free static site in `dist/`. All URLs are relative, so the same build works under the GitHub Pages project path `https://buicongnguyen.github.io/Leetcode_Quest_Design/`.

## GitHub Pages

`.github/workflows/pages.yml` validates and builds the site on `main`, uploads `dist/`, and deploys it with GitHub's official Pages actions. `.github/workflows/ci.yml` runs the same validation for branches and pull requests.
