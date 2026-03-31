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
  en/
    _meta.json            # Category metadata
    handbook/             # Governance, contributor docs
    guides/               # Tutorials and how-tos
    reference/            # System specs & automation docs
    snippets/             # Reusable MDX fragments
    _partials/            # Shared MDX/Markdown includes
  es/
    _meta.json            # Category metadata (Spanish)
    ...same structure as en
```

Each page needs valid frontmatter plus a stable slug. Files can be Markdown (`.md`) or
MDX (`.mdx`). Keep identical slugs across locales, for example:
`docs/en/guides/getting-started.mdx` and `docs/es/guides/getting-started.mdx`.

## Assets

```text
assets/
  images/                 # webp/svg exports
  diagrams/               # source files (.drawio, .excalidraw, etc.)
  content/                # normalized JSON datasets for Pokemon + moves
    en/
      pokemon/            # one file per Pokemon, generated via content:split
      moves/              # one file per move, generated via content:split
    es/
      pokemon/            # Spanish dataset mirror (currently copied from en)
      moves/              # Spanish dataset mirror (currently copied from en)
```

Images referenced from docs must live under `assets/`. Diagrams keep their
editable sources so future contributors can revise them. Structured datasets for
Pokemon and moves also live under `assets/content/` so search indexing and the
frontend can diff individual entries.

> ℹ️ Upstream content drops land as `assets/content/wikiPokemon.json` and
> `assets/content/wikiMoves.json`. Run `npm run content:split` to regenerate
> the per-entry files tracked in git.

## Schemas & Scripts

- `schemas/frontmatter.schema.json` – JSON Schema used by `npm run lint:frontmatter`.
- `scripts/validate-frontmatter.ts` – Ensures metadata consistency.
- `scripts/check-images.ts` – Validates file format, size, and alt text.
- `scripts/build-search-index.ts` – Creates search payloads plus frontend
  content manifests in `build/content/<locale>/`, then optionally pushes the
  docs/pokemon/moves indices to Meilisearch.
- `scripts/split-content-data.ts` – Splits upstream `wikiPokemon.json` and
  `wikiMoves.json` into locale-scoped directories under
  `assets/content/<locale>/{pokemon,moves}` via
  `npm run content:split`.

## GitHub Automation

```text
.github/
  ISSUE_TEMPLATE/         # Bug + content request forms
  workflows/
    ci.yml                # Runs npm run ci + npm run audit:prod on push/PR
    search-index.yml      # Builds search payloads + frontend manifests
  PULL_REQUEST_TEMPLATE.md
CODEOWNERS
```

This repository now houses the wiki as a standalone project. All automation lives at
the repo root (`.github/workflows`, shared lint scripts, CODEOWNERS) so nothing
depends on a surrounding monorepo layout anymore. Downstream jobs (search indexing,
link checks, linting) only look at this repo's files, which keeps CI scopes and
required secrets simple.
