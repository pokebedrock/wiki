---
title: Website Sync Pipeline
description: How the search-index workflow posts generated payloads to the website backend.
tags:
  - reference
  - sync
lastUpdated: "2026-04-03"
status: beta
lang: en
toc: true
order: 1
---

## Overview

1. Docs or structured content changes land on `main`.
2. `.github/workflows/search-index.yml` installs dependencies and runs
   `npm run build:search`.
3. The workflow uploads generated search artifacts for debugging and manual inspection.
4. If backend sync secrets are configured, the workflow `POST`s
   `build/search-indices.json` to the website backend.
5. The backend reindexes the private Meilisearch instance from that JSON payload.

## What the workflow sends

The backend sync step sends the exact contents of `build/search-indices.json` with:

- `Authorization: Bearer $WIKI_SEARCH_SYNC_TOKEN`
- `Content-Type: application/json`

That payload contains the generated `wiki-docs`, `wiki-pokemon`, and `wiki-moves`
index documents built from the repo's docs plus `assets/content/<locale>/` datasets.

## Required CI secrets

| Secret | Description |
| --- | --- |
| `WIKI_SEARCH_SYNC_URL` | Public HTTPS endpoint exposed by the website backend for search imports |
| `WIKI_SEARCH_SYNC_TOKEN` | Shared bearer token validated by the backend before it accepts the payload |

If either secret is missing, the workflow skips backend sync and still uploads the
build artifacts so maintainers can inspect the generated payloads.

## Local testing

You can test the production-style sync locally after generating the payloads:

```bash
npm ci
npm run build:search
curl --fail-with-body --show-error --silent \
  -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  --data-binary @build/search-indices.json \
  https://api.pokebedrock.com/wiki/search/sync
```

Replace the URL and token with the environment used by the target backend.

## Artifacts produced by the workflow

The workflow uploads these generated files even when backend sync is skipped:

- `build/search-index.json`
- `build/search-indices.json`
- `build/content/en/pokemon-manifest.json`
- `build/content/en/moves-manifest.json`
- `build/content/en/move-learners-manifest.json`
- `build/content/es/pokemon-manifest.json`
- `build/content/es/moves-manifest.json`
- `build/content/es/move-learners-manifest.json`

Those artifacts make it easier to diff generated search data without exposing the
private Meilisearch service directly.
