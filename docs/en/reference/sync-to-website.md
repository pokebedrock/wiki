---
title: Website Sync Pipeline
description: How search-index builds POST manifest payloads to the website backend and refresh the public site cache.
tags:
  - reference
  - sync
lastUpdated: "2026-05-04"
status: beta
lang: en
toc: true
order: 1
---

## Overview

1. Docs or structured content merge into `main`.
2. `.github/workflows/search-index.yml` runs `npm run build:search`.
3. The workflow `POST`s `build/search-indices.json` to the website backend when
   `WIKI_SEARCH_SYNC_URL` and `WIKI_SEARCH_SYNC_TOKEN` are configured.
4. The backend refreshes the search payload consumed by the public site.

## Sync Request Contract

The current sync is a bearer-authenticated JSON upload, not a repository webhook.
The request body is the generated `build/search-indices.json` file.

| Part | Description |
| --- | --- |
| `Authorization` header | `Bearer $WIKI_SEARCH_SYNC_TOKEN` |
| `Content-Type` header | `application/json` |
| Request body | Raw `build/search-indices.json` payload |
| Target URL | `WIKI_SEARCH_SYNC_URL` |

See `.github/workflows/search-index.yml` for the exact CI request shape.

## Local Testing

Build the payload locally, then `POST` the generated artifact to the backend.

```bash
npm run build:search
curl --fail-with-body --show-error --silent \
  -X POST \
  -H "Authorization: Bearer $WIKI_SEARCH_SYNC_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @build/search-indices.json \
  "$WIKI_SEARCH_SYNC_URL"
```

## Cache Behavior

- `scripts/build-search-index.ts` regenerates the combined docs, Pokemon, and moves
  search payloads before every sync.
- If backend sync credentials are unset, the workflow still uploads the generated
  artifacts so maintainers can inspect or replay the payload manually.
- The public site reads the refreshed search dataset from the website backend rather
  than fetching changed markdown files directly from GitHub.



