---
title: Website Sync Pipeline
description: How GitHub pushes trigger the backend webhook and keep the public site cached.
tags:
  - reference
  - sync
lastUpdated: "2026-04-12"
status: stable
lang: en
toc: true
order: 1
---

## Overview

The legacy "list of changed files" webhook has been replaced by a search-driven sync
pipeline. Every push to `main` that touches docs, schemas, scripts, or build config (plus
the nightly cron) triggers `.github/workflows/search-index.yml` (`wiki-search`). The job:

1. Runs `npm run build:search`, which outputs `build/search-index.json`, the multi-index
   payload `build/search-indices.json`, and the localized manifests under
   `build/content/<locale>/`.
2. If `WIKI_SEARCH_SYNC_URL` + `WIKI_SEARCH_SYNC_TOKEN` are configured, POSTs
   `build/search-indices.json` to the website backend so it can re-seed Meilisearch from
   inside the cluster.
3. Uploads all generated artifacts regardless of whether backend sync ran, so operators can
   download the payloads for manual debugging.

## Backend Sync Contract

| Secret | Description |
| --- | --- |
| `WIKI_SEARCH_SYNC_URL` | HTTPS endpoint inside the website backend that accepts the search payload |
| `WIKI_SEARCH_SYNC_TOKEN` | Bearer token validated by the backend before it replaces the indexes |

- Method: `POST`
- Headers: `Authorization: Bearer <WIKI_SEARCH_SYNC_TOKEN>`, `Content-Type: application/json`
- Body: exact bytes of `build/search-indices.json`

`build/search-indices.json` is a JSON object with three arrays that mirror the Meilisearch
indexes the backend owns:

```json
{
  "docs": [
    {
      "id": "guides/getting-started",
      "slug": "guides/getting-started",
      "title": "Getting Started",
      "description": "Short summary…",
      "tags": ["guide", "onboarding"],
      "lastUpdated": "2026-04-12",
      "status": "stable",
      "lang": "en",
      "order": 3,
      "body": "Markdown content without frontmatter"
    }
  ],
  "pokemon": [
    {
      "id": "rayquaza",
      "name": "Rayquaza",
      "description": "Legendary dragon/flying Pokémon.",
      "types": ["dragon", "flying"],
      "tags": ["legendary"],
      "sortOrder": 384
    }
  ],
  "moves": [
    {
      "id": "ally-switch",
      "name": "Ally Switch",
      "description": "User swaps positions with its ally.",
      "type": "psychic",
      "category": "status",
      "sortOrder": 502
    }
  ]
}
```

The backend should overwrite `wiki-docs`, `wiki-pokemon`, and `wiki-moves` using that
payload, then warm any downstream caches. Because the payload already includes
`lastUpdated` from doc frontmatter, clients can continue surfacing freshness metadata
without hitting GitHub.

## Failure & Fallback Modes

- The workflow step uses `curl --fail-with-body`; a `4xx/5xx` from the backend causes the
  job to fail so maintainers notice immediately.
- When either secret is blank, the workflow logs a skip message and still uploads the
  artifacts. Operators can download the `search-index` artifact and manually POST it using
  the procedure below.
- `build/scripts/build-search-index.ts` emits "MEILISEARCH_URL/KEY not set" warnings when
  running locally; those warnings simply note that the optional direct Meilisearch sync was
  skipped. They do not block the GitHub workflow.

## Manual Testing

Generate the payload locally and POST it to a staging backend:

```bash
npm run build:search

curl --fail-with-body --show-error --silent \
  -X POST \
  -H "Authorization: Bearer $WIKI_SEARCH_SYNC_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @build/search-indices.json \
  "$WIKI_SEARCH_SYNC_URL"
```

Replace the environment variables with the staging or production values. The backend
should respond with `2xx` and log the number of documents imported per index.

## Cache Invalidation Expectations

- After a successful sync, the backend should purge any cached wiki responses (Redis, CDN,
  or edge caches) so the new `lastUpdated` timestamps propagate quickly.
- Frontend clients use the manifests under `build/content/<locale>/` for navigation and
  the Meilisearch indexes for keyword search, so keeping the sync endpoint healthy is the
  fastest way to reflect wiki changes without having to re-fetch raw Markdown from GitHub.


