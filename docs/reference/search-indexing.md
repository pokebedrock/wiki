---
title: Search Indexing
description: Details for running the Meilisearch indexing workflow locally and in CI.
tags:
  - reference
  - search
lastUpdated: "2025-11-21"
status: beta
lang: en
toc: true
order: 2
---

## Workflow

- `scripts/build-search-index.ts` scans docs plus JSON content datasets
  (`assets/content/wikiPokemon.json` and `assets/content/wikiMoves.json`),
  then writes `build/search-index.json`.
- If `MEILISEARCH_URL` and `MEILISEARCH_KEY` are set, the script pushes the payload
  directly to the configured index (defaults to `wiki-docs`).
- `.github/workflows/search-index.yml` runs the script on `main` and nightly, then uploads
  the JSON payload to the website backend's protected sync endpoint so Meilisearch can stay private.

## Required Settings

| Variable | Description |
| --- | --- |
| `MEILISEARCH_URL` | Base URL of the self-hosted Meilisearch instance |
| `MEILISEARCH_KEY` | Admin or documents key with write access |
| `MEILISEARCH_INDEX` | Optional override of the index UID |

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

The command writes the JSON file and pushes it to the remote cluster when env vars are set.

## Production Sync Endpoint

The default production flow does not expose Meilisearch publicly:

1. GitHub Actions builds `build/search-index.json`.
2. The workflow `POST`s that JSON to the website backend.
3. The backend validates `WIKI_SEARCH_SYNC_TOKEN`.
4. The backend connects to `http://meilisearch:7700` inside the cluster and replaces the `wiki-docs` index.

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

