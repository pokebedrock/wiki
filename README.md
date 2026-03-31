# PokéBedrock Wiki

Central content repository for PokéBedrock documentation. This repo stores
Markdown/MDX pages, media assets, lint rules, and CI workflows that keep the docs
consistent before syncing to the public website.

## Quickstart

1. Install Node 20+.
2. Run `npm ci` from the repository root.
3. Create/edit docs under `docs/en/` or `docs/es/`.
4. Run `npm run ci` locally before opening a PR.

## Repository Layout

- `docs/` – localized Markdown/MDX source (`docs/en/**`, `docs/es/**`) organized by category with required frontmatter and locale-scoped `_meta.json`.
- `assets/` – shared media (`webp` images, diagrams, LFS-tracked large files).
- `docs/<locale>/_partials/` + `docs/<locale>/snippets/` – reusable MDX fragments imported via relative paths.
- `schemas/` – JSON Schema for validating doc frontmatter.
- `scripts/` – Node utilities for linting, validation, search indexing.
- `.github/` – issue templates, PR template, CI workflows (linting, link checks, search indexing).

## Writing Docs

- Every page must include the schema defined in `schemas/frontmatter.schema.json`.
- Use MDX when you need components, tabs, or callouts; plain Markdown is fine for simple prose.
- Prefer admonitions (`:::note`) for tips/warnings and reuse snippets from `docs/<locale>/_partials`.
- Images should live inside `assets/` and be referenced with relative paths. Always supply descriptive alt text.
- Keep docs slugs aligned across locales, for example `docs/en/guides/getting-started.mdx` and `docs/es/guides/getting-started.mdx`.

## Tooling & Scripts

| Command | Description |
| --- | --- |
| `npm run lint:md` | markdownlint checks + formatting rules |
| `npm run lint:frontmatter` | Validates doc metadata using JSON Schema |
| `npm run lint:images` | Ensures relative assets exist, are `webp/svg`, and include alt text |
| `npm run lint:links` | Crawls docs with Linkinator for broken links |
| `npm run lint` | Runs markdownlint + frontmatter + image checks |
| `npm run check` | Authoring checks (`lint` + link check) |
| `npm run ci` | CI gate (`lint`, links, search build, generated-file drift check) |
| `npm run build` | Default build entrypoint (aliases `build:search`) |
| `npm run audit:prod` | Audits production dependency graph |
| `npm run build:search` | Generates search payloads plus frontend content manifests in `build/content/<locale>/` |
| `npm run check:generated` | Builds search/manifests and fails if tracked JSON drifts from the repo copies |
| `npm run content:split` | Splits legacy monolithic content JSON into per-item files under `assets/content/<locale>/` |

Search fallback artifacts (`build/search-index.json`, `build/search-indices.json`, and
`build/content/<locale>/*-manifest.json`) are tracked in git so `npm run check:generated`
can catch drift. Re-run the check after editing docs and commit the updated JSON if
required.

## CI & Deployment

- `ci.yml` runs `npm run ci` plus `npm run audit:prod` for every PR and push.
- `search-index.yml` builds the search payloads on pushes to `main`, uploads both the
  search JSON files and generated frontend content manifests as the workflow artifact, and
  posts `build/search-indices.json` to the website backend's protected sync endpoint so the
  backend can reindex Meilisearch from inside the cluster.
- The same build writes content manifests used by the frontend for fast wiki content
  list/detail navigation:
  - `build/content/en/pokemon-manifest.json` and `build/content/es/pokemon-manifest.json`
  - `build/content/en/moves-manifest.json` and `build/content/es/moves-manifest.json`
  - `build/content/en/move-learners-manifest.json` and `build/content/es/move-learners-manifest.json`
- A webhook (documented in `docs/en/reference/sync-to-website.md`) notifies the website
  backend when docs change; the website fetches raw Markdown via the GitHub API and
  caches using ETags.

## Contributing

Read `CONTRIBUTING.md` for branching strategy, review expectations, localization
workflow, and content guidelines. Issue templates cover bugs and content requests, while
CODEOWNERS ensures the docs team reviews every change.

Release checklist: [`docs/en/reference/release-checklist.md`](./docs/en/reference/release-checklist.md)

