---
title: Website sync pipeline
description: How the wiki repo pushes search artifacts to the website backend and Meilisearch.
tags:
  - reference
  - sync
lastUpdated: "2026-04-07"
status: beta
lang: en
toc: true
order: 1
---

## Overview

The wiki no longer sends generic `wiki.synced` webhooks. Instead, every push to `main`
(or the nightly cron) triggers `.github/workflows/search-index.yml`, which:

1. Checks out the repo and installs dependencies with `npm ci`.
2. Runs `npm run build:search` to regenerate:
   - `build/search-index.json` (combined offline fallback)
   - `build/search-indices.json` (per-index Meilisearch payload)
   - Frontend manifests under `build/content/<locale>/` for Pokémon, moves, and move learners.
3. When both `WIKI_SEARCH_SYNC_URL` and `WIKI_SEARCH_SYNC_TOKEN` secrets are configured, POSTs
   `build/search-indices.json` to the website backend's protected sync endpoint.
4. Uploads the generated artifacts so runs stay debuggable even when backend sync is disabled.

The backend validates the bearer token versus `WIKI_SEARCH_SYNC_TOKEN`, streams the payload into
Meilisearch (`wiki-docs`, `wiki-pokemon`, `wiki-moves`), and applies consistent settings
(searchable/filterable/sortable attributes) before replacing the documents.

## Secrets & configuration

| Location | Variable | Purpose |
| --- | --- | --- |
| GitHub Actions | `WIKI_SEARCH_SYNC_URL` | HTTPS endpoint exposed by the website backend (usually `https://api.pokebedrock.com/internal/wiki/search-index`). |
| GitHub Actions | `WIKI_SEARCH_SYNC_TOKEN` | Shared secret injected as the bearer token when calling the backend. |
| Website backend | `WIKI_SEARCH_SYNC_TOKEN` | Expected token; must match the GitHub secret. |
| Website backend | `MEILI_URL`, `MEILI_KEY`/`MEILI_MASTER_KEY` | Meilisearch connection used to ingest the uploaded indices. |

If the GitHub-side secrets are blank, the workflow logs a skipped-sync notice and still uploads
artifacts for manual inspection.

## Request contract

| Field | Description |
| --- | --- |
| Method | `POST` |
| URL | `https://api.pokebedrock.com/internal/wiki/search-index` (or the environment-specific URL). |
| Headers | `Authorization: Bearer <WIKI_SEARCH_SYNC_TOKEN>` plus `Content-Type: application/json`. |
| Body | JSON document with `docs`, `pokemon`, and `moves` arrays matching the schema emitted by `scripts/build-search-index.ts`. Each record includes `id`, `slug`, `title`, `description`, `tags`, `status`, `lang`, `order`, `lastUpdated`, and the (optional) `body`. |
| Success response | `{ "ok": true, "indices": { docs: { indexUid, documentCount, taskUid }, ... } }`. |
| Failure responses | `401` when the bearer token is missing/invalid, `503` when Meilisearch or sync credentials are not configured, plus a Problem+JSON payload with details. |

### Example payload

```json
{
  "docs": [
    {
      "id": "guides/getting-started",
      "slug": "guides/getting-started",
      "title": "Getting Started",
      "description": "Spin up PokéBedrock locally.",
      "tags": ["guide", "server"],
      "status": "stable",
      "lang": "en",
      "order": 10,
      "lastUpdated": "2026-03-28",
      "body": "Markdown body without frontmatter"
    }
  ],
  "pokemon": [],
  "moves": []
}
```

### Manual curl test

```bash
curl --fail-with-body --show-error --silent \
  -X POST \
  -H "Authorization: Bearer $WIKI_SEARCH_SYNC_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @build/search-indices.json \
  "$WIKI_SEARCH_SYNC_URL"
```

Use the workflow artifact (search-index.zip) if you need to re-send a past run manually.

## Troubleshooting

- **401 Unauthorized** – GitHub secret and backend `WIKI_SEARCH_SYNC_TOKEN` disagree. Rotate both
  sides in lockstep.
- **503 Wiki search sync is not configured** – Backend is missing the token or Meilisearch
  env vars. Deploy with `WIKI_SEARCH_SYNC_TOKEN`, `MEILI_URL`, and `MEILI_KEY/MEILI_MASTER_KEY`.
- **Search results stale** – Trigger `workflow_dispatch` for `wiki-search` to rebuild artifacts and
  push a fresh payload once backend config is fixed.
- **Need to inspect payload** – Download the workflow artifact to inspect the generated manifests
  and confirm the diff before retrying the sync.
