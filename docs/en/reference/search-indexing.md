---
title: Search Indexing
description: Details for running the Meilisearch indexing workflow locally and in CI.
tags:
  - reference
  - search
lastUpdated: "2026-04-11"
status: beta
lang: en
toc: true
order: 2
---

## Workflow

- `scripts/build-search-index.ts` scans docs plus JSON content datasets under
  `assets/content/<locale>/pokemon/` and `assets/content/<locale>/moves/`.
- It writes:
  - `build/search-index.json` for local merged search fallback
  - `build/search-indices.json` for remote multi-index syncing
  - `build/content/en/pokemon-manifest.json` and `build/content/es/pokemon-manifest.json`
    for fast frontend Pokemon list/navigation
  - `build/content/en/moves-manifest.json` and `build/content/es/moves-manifest.json`
    for fast frontend move list/navigation
  - `build/content/en/move-learners-manifest.json` and
    `build/content/es/move-learners-manifest.json` for fast move detail learner lookups
- If `MEILISEARCH_URL` and `MEILISEARCH_KEY` are set, the script pushes each
  index payload (`wiki-docs`, `wiki-pokemon`, and `wiki-moves`) directly to the
  corresponding Meilisearch index.
- `.github/workflows/search-index.yml` runs the script on `main` and nightly, uploads the
  generated search payloads plus frontend content manifests as workflow artifacts, then sends
  the multi-index JSON payload to the website backend's protected sync endpoint so Meilisearch
  can stay private.

## Content datasets & fallback split

- Authoritative Pokemon and move dumps can be dropped into
  `assets/content/wikiPokemon.json` and `assets/content/wikiMoves.json`. These monolith files
  usually come from the game data exporter.
- Run `npm run content:split` after updating either monolith. The script splits the entries
  into one file per Pokemon/move under `assets/content/<locale>/**` and normalizes any missing
  `sortOrder` fields.
- When the monolith JSON files are absent (current default), the split script clones the
  already-tracked English fallback directories (`assets/content/en/pokemon/` and
  `assets/content/en/moves/`) into every locale so search/index builds still have data.
- Spanish (`es`) content currently mirrors the English fallback until localized datasets are
  delivered. The split command will keep doing that automatically, so translators only need to
  commit the localized JSON once it exists.
- Because the generated `assets/content/<locale>/**` files are committed, `npm run ci` can
  detect drift in manifests/search payloads without having to re-run the exporter during every
  PR.

## Required Settings

| Variable | Description |
| --- | --- |
| `MEILISEARCH_URL` | Base URL of the self-hosted Meilisearch instance |
| `MEILISEARCH_KEY` | Admin or documents key with write access |

## Optional CI Settings

| Secret | Description |
| --- | --- |
| `WIKI_SEARCH_SYNC_URL` | Optional public HTTPS URL of the backend sync endpoint |
| `WIKI_SEARCH_SYNC_TOKEN` | Optional shared bearer token validated by the backend before importing documents |

When both secrets are configured, the workflow syncs
`build/search-indices.json` to the website backend. When either secret is missing,
the workflow still builds the search payloads and uploads the generated artifacts
so the run stays debuggable.

## Local Run

```bash
MEILISEARCH_URL=https://search.pokebedrock.com \
MEILISEARCH_KEY=<docs-key> \
npm run build:search
```

The command writes the search payloads plus frontend manifests, and pushes the three remote
indices when env vars are set.

## Production Sync Endpoint

The default production flow does not expose Meilisearch publicly:

1. GitHub Actions builds `build/search-index.json`, `build/search-indices.json`,
   and the frontend content manifests under `build/content/<locale>/`
   (`pokemon-manifest.json`, `moves-manifest.json`, `move-learners-manifest.json`).
   All of these are uploaded as workflow artifacts.
2. If `WIKI_SEARCH_SYNC_URL` and `WIKI_SEARCH_SYNC_TOKEN` are configured, the workflow `POST`s `build/search-indices.json` to the website backend.
3. When those secrets are not configured yet, the workflow skips the backend sync step and still uploads the generated artifacts.
4. If sync runs, the backend validates `WIKI_SEARCH_SYNC_TOKEN`.
5. The backend then connects to `http://meilisearch:7700` inside the cluster and replaces:
   - `wiki-docs`
   - `wiki-pokemon`
   - `wiki-moves`

## Document Schema

```json
{
  "id": "guides/getting-started",
  "slug": "guides/getting-started",
  "title": "Getting Started",
  "description": "Short summary…",
  "tags": ["guide", "onboarding"],
  "lastUpdated": "2025-11-21",
  "status": "stable",
  "lang": "en",
  "order": 3,
  "body": "Markdown content without frontmatter"
}
```

Keep descriptions ≤ 180 characters to avoid truncation in search UIs.
