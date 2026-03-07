---
title: Repository Structure
description: Breakdown of the wiki folders, metadata files, and how the website consumes them.
tags:
  - handbook
  - structure
lastUpdated: "2026-03-07"
status: stable
lang: en
toc: true
order: 2
---

## Docs Tree

```text
docs/
  _meta.json              # Category metadata
  handbook/               # Governance, contributor docs
  guides/                 # Tutorials and how-tos
  reference/              # System specs & automation docs
  snippets/               # Reusable MDX fragments
  _partials/              # Shared MDX/Markdown includes
```

Each page needs valid frontmatter plus a stable slug. Files can be Markdown (`.md`) or
MDX (`.mdx`). When a localized version is added, move the file into a folder named after
the slug (see `docs/guides/running-the-server` for an example).

## Assets

```text
assets/
  images/                 # webp/svg exports
  diagrams/               # source files (.drawio, .excalidraw, etc.)
```

Images referenced from docs must live under `assets/`. Diagrams keep their editable sources so future contributors can revise them.

## Schemas & Scripts

- `schemas/frontmatter.schema.json` – JSON Schema used by `npm run lint:frontmatter`.
- `scripts/validate-frontmatter.ts` – Ensures metadata consistency.
- `scripts/check-images.ts` – Validates file format, size, and alt text.
- `scripts/build-search-index.ts` – Creates search payloads plus frontend
  content manifests in `build/`, then optionally pushes the
  docs/pokemon/moves indices to Meilisearch.

## GitHub Automation

```text
.github/
  ISSUE_TEMPLATE/         # Bug + content request forms
  workflows/
    ci.yml                # Lint + link-check on PRs
    search-index.yml      # Builds and uploads search docs
  PULL_REQUEST_TEMPLATE.md
CODEOWNERS
```

This repository now houses the wiki as a standalone project. All automation lives at
the repo root (`.github/workflows`, shared lint scripts, CODEOWNERS) so nothing
depends on a surrounding monorepo layout anymore. Downstream jobs (search indexing,
link checks, linting) only look at this repo's files, which keeps CI scopes and
required secrets simple.
