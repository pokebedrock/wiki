---
title: Search Indexing
description: Details for running the Meilisearch indexing workflow locally and in CI.
tags:
  - reference
  - search
lastUpdated: "2026-04-17"
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

## Optional Remote Index Push Settings

| Variable | Description |
| --- | --- |
| `MEILISEARCH_URL` | Base URL of the self-hosted Meilisearch instance |
| `MEILISEARCH_KEY` | Admin or documents key with write access |

These variables are only needed when you want `npm run build:search` to push
records directly to Meilisearch after generating the local JSON artifacts.

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

Generate the tracked JSON artifacts without any remote push:

```bash
npm run build:search
```

Push the three remote indices too when Meilisearch credentials are available:

```bash
MEILISEARCH_URL=https://search.pokebedrock.com \
MEILISEARCH_KEY=<docs-key> \
npm run build:search
```

In both cases the command writes the search payloads plus frontend manifests locally;
remote sync only happens when the env vars are set.

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

