---
title: Search Indexing
description: Details for running the Meilisearch indexing workflow locally and in CI.
tags:
  - reference
  - search
lastUpdated: "2026-03-11"
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

## Required Settings

| Variable | Description |
| --- | --- |
| `MEILISEARCH_URL` | Base URL of the self-hosted Meilisearch instance |
| `MEILISEARCH_KEY` | Admin or documents key with write access |

## CI Settings

| Secret | Description |
| --- | --- |
| `WIKI_SEARCH_SYNC_URL` | Public HTTPS URL of the backend sync endpoint |
| `WIKI_SEARCH_SYNC_TOKEN` | Shared bearer token validated by the backend before importing documents |

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

1. GitHub Actions builds `build/search-index.json` and `build/search-indices.json`.
2. The workflow `POST`s `build/search-indices.json` to the website backend.
3. The backend validates `WIKI_SEARCH_SYNC_TOKEN`.
4. The backend connects to `http://meilisearch:7700` inside the cluster and replaces:
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

