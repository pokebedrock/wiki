# PokéBedrock Wiki

Central content repository for PokéBedrock documentation. This repo stores
Markdown/MDX pages, media assets, lint rules, and CI workflows that keep the docs
consistent before syncing to the public website.

## Quickstart

1. Install Node 20+.
2. Run `npm install` from `wiki/`.
3. Create/edit docs under `docs/`.
4. Run `npm run lint` locally before opening a PR.

## Repository Layout

- `docs/` – source Markdown/MDX organized by category with required frontmatter. `_meta.json` defines ordering and labels.
- `assets/` – shared media (`webp` images, diagrams, LFS-tracked large files).
- `docs/_partials/` + `docs/snippets/` – reusable MDX fragments imported via relative paths.
- `schemas/` – JSON Schema for validating doc frontmatter.
- `scripts/` – Node utilities for linting, validation, search indexing.
- `.github/` – issue templates, PR template, CI workflows (linting, link checks, search indexing).

## Writing Docs

- Every page must include the schema defined in `schemas/frontmatter.schema.json`.
- Use MDX when you need components, tabs, or callouts; plain Markdown is fine for simple prose.
- Prefer admonitions (`:::note`) for tips/warnings and reuse snippets from `docs/_partials`.
- Images should live inside `assets/` and be referenced with relative paths. Always supply descriptive alt text.
- For translated docs, create a folder named after the slug and add `<lang>.md`; English lives either directly as `<slug>.md` or as `/<slug>/en.md`.

## Tooling & Scripts

| Command | Description |
| --- | --- |
| `npm run lint:md` | markdownlint checks + formatting rules |
| `npm run lint:frontmatter` | Validates doc metadata using JSON Schema |
| `npm run lint:images` | Ensures relative assets exist, are `webp/svg`, and include alt text |
| `npm run lint:links` | Crawls docs with Linkinator for broken links |
| `npm run lint` | Runs markdownlint + frontmatter + image checks |
| `npm run check` | Full suite (`lint` + link check) |
| `npm run build:search` | Generates `build/search-index.json` for Meilisearch ingestion |

## CI & Deployment

- `ci.yml` runs lint + validation + link checks for every PR.
- `search-index.yml` builds `search-index.json` on pushes to `main` and ships it to a
  self-hosted Meilisearch instance via API (requires repo secrets).
- A webhook (documented in `docs/reference/sync-to-website.md`) notifies the website
  backend when docs change; the website fetches raw Markdown via the GitHub API and
  caches using ETags.

## Contributing

Read `CONTRIBUTING.md` for branching strategy, review expectations, localization
workflow, and content guidelines. Issue templates cover bugs and content requests, while
CODEOWNERS ensures the docs team reviews every change.


