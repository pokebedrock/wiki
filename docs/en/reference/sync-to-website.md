---
title: Website Sync Pipeline
description: How the wiki search workflow uploads generated indices to the backend and refreshes Meilisearch.
tags:
  - reference
  - sync
lastUpdated: "2026-04-08"
status: beta
lang: en
toc: true
order: 1
---

## Overview

1. Docs merge into `main`.
2. The `wiki-search` GitHub Actions workflow runs `npm run build:search`, which emits
   `build/search-index.json`, `build/search-indices.json`, and the localized content manifests.
3. The workflow always uploads those artifacts for operators to download.
4. When `WIKI_SEARCH_SYNC_URL` and `WIKI_SEARCH_SYNC_TOKEN` secrets are configured, the job
   `POST`s `build/search-indices.json` to the backend.
5. The backend writes each payload (`docs`, `pokemon`, `moves`) into the internal Meilisearch
   cluster and powers wiki + Pokédex search with the refreshed data.

## Backend sync endpoint

- **Path:** `POST /internal/wiki/search-index` (point `WIKI_SEARCH_SYNC_URL` here, e.g.
  `https://api.pokebedrock.com/internal/wiki/search-index`).
- **Auth:** `Authorization: Bearer <WIKI_SEARCH_SYNC_TOKEN>`.
- **Body limit:** 20 MiB (`WIKI_SEARCH_SYNC_BODY_LIMIT_BYTES`).
- **Backend prerequisites:** `WIKI_SEARCH_SYNC_TOKEN`, `MEILI_URL`, and one of `MEILI_KEY` or
  `MEILI_MASTER_KEY` must be set. Without them the route returns `503`.

### Payload shape

`build/search-indices.json` contains three arrays that all share the same record structure.

| Field | Type | Description |
| --- | --- | --- |
| `docs` | `SearchRecord[]` | Localized documentation pages (frontmatter + MDX body). |
| `pokemon` | `SearchRecord[]` | Generated Pokémon encyclopedia records. |
| `moves` | `SearchRecord[]` | Generated move encyclopedia records. |

`SearchRecord` properties:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `string` | Stable identifier (`docs/en/...`, `content/en/pokemon/...`, etc.). |
| `slug` | `string` | URL-ready path without locale prefix for docs. |
| `title` | `string?` | From frontmatter (`docs`) or content JSON (`pokemon`/`moves`). |
| `description` | `string?` | Metadata description; surfaced in autocomplete. |
| `tags` | `string[]` | Normalized tags (locale, category, type, status). |
| `lastUpdated` | `string?` | ISO date string copied from frontmatter when present. |
| `status` | `string` | `stable`/`beta`/`draft`, matching repo frontmatter. |
| `lang` | `string` | Locale code (`en` or `es`). |
| `order` | `number` | Stable ordering used for deterministic pagination. |
| `body` | `string?` | Markdown content (docs) or synthesized summary text (data files). |

### Response shape

The backend responds with per-index ingestion stats once Meilisearch finishes syncing:

```json
{
  "ok": true,
  "indices": {
    "docs": { "indexUid": "wiki-docs", "documentCount": 420, "taskUid": 1012 },
    "pokemon": { "indexUid": "wiki-pokemon", "documentCount": 1025, "taskUid": 1013 },
    "moves": { "indexUid": "wiki-moves", "documentCount": 890, "taskUid": 1014 }
  }
}
```

## Local testing

1. Run `npm run build:search` to produce `build/search-indices.json` locally.
2. Use the sample payload in `docs/en/reference/search-sync-example.json` (trimmed data that
   matches the schema above).
3. Send the payload to your staging backend:

```bash
WIKI_SEARCH_SYNC_URL=https://api.pokebedrock.com/internal/wiki/search-index \
WIKI_SEARCH_SYNC_TOKEN=dev-secret \
curl --fail --show-error --silent \
  -X POST \
  -H "Authorization: Bearer ${WIKI_SEARCH_SYNC_TOKEN}" \
  -H "Content-Type: application/json" \
  --data-binary @docs/en/reference/search-sync-example.json \
  "${WIKI_SEARCH_SYNC_URL}"
```

## Cache + search consumers

- The Meilisearch ingestion is synchronous inside the backend route, so the wiki, Pokédex, and
  move search endpoints observe fresh data as soon as the workflow finishes.
- Wiki pages still include `lastUpdated` from frontmatter. Clients can use that metadata to decide
  whether to invalidate their own caches after a sync completes.


