---
title: Website Sync Pipeline
description: How the wiki-search workflow pushes fresh docs/search data to the website backend.
tags:
  - reference
  - sync
lastUpdated: "2026-04-11"
status: stable
lang: en
toc: true
order: 1
---

## Overview

1. Merges to `main` (and the nightly cron) trigger `.github/workflows/search-index.yml`.
2. The workflow runs `npm run build:search`, which rebuilds the docs index plus the
   Pokemon and move manifests under `build/content/<locale>/`.
3. The generated JSON is always uploaded as a workflow artifact for debugging.
4. When `WIKI_SEARCH_SYNC_URL` and `WIKI_SEARCH_SYNC_TOKEN` secrets are set, the workflow
   `POST`s `build/search-indices.json` to the website backend so it can import the data
   from inside the cluster without exposing Meilisearch publicly.
5. The backend swaps the `wiki-docs`, `wiki-pokemon`, and `wiki-moves` indexes and
   invalidates cached wiki responses.

## Endpoint & Secrets

| Secret | Description |
| --- | --- |
| `WIKI_SEARCH_SYNC_URL` | HTTPS endpoint exposed by the website backend that accepts the multi-index payload. |
| `WIKI_SEARCH_SYNC_TOKEN` | Bearer token validated by the backend before accepting uploads. |

The workflow sends the request with:

- `POST $WIKI_SEARCH_SYNC_URL`
- `Authorization: Bearer $WIKI_SEARCH_SYNC_TOKEN`
- `Content-Type: application/json`
- Body: the raw contents of `build/search-indices.json`

When either secret is blank the workflow logs the skip message and still uploads the
artifact so operators can transfer the JSON manually.

## Request Body Format

`build/search-indices.json` is shaped as:

```json
{
  "docs": [SearchRecord],
  "pokemon": [SearchRecord],
  "moves": [SearchRecord]
}
```

Each `SearchRecord` includes:

| Field | Description |
| --- | --- |
| `id` | Stable identifier (`en/guides/getting-started`, `content/en/pokemon/pikachu`, etc.). |
| `slug` | Route relative to the locale/category used by the frontend. |
| `title` | Rendered title shown in search results. |
| `description` | Summary text displayed alongside the title. |
| `tags` | Normalized tags for filtering (locale, category, type). |
| `lastUpdated` | ISO string sourced from frontmatter (docs only). |
| `status` | `draft`, `beta`, or `stable`. |
| `lang` | Locale code (`en`, `es`). |
| `order` | Numeric sort order used inside Meilisearch. |
| `body` | Markdown body stripped of frontmatter or synthesized Pokemon/move copy. |

See `docs/en/reference/webhook-example.json` for a trimmed payload sample.

## Local Testing

Use the sample payload to validate the endpoint manually:

```bash
curl --fail-with-body --show-error --silent \
  -X POST \
  -H "Authorization: Bearer $WIKI_SEARCH_SYNC_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @docs/en/reference/webhook-example.json \
  https://api.pokebedrock.com/wiki/search-sync
```

Swap the URL for your staging endpoint when needed. The same command structure is used by
the `wiki-search` workflow (except it sends the freshly generated `build/search-indices.json`).

## Failure Handling & Observability

- `curl --fail-with-body` causes the workflow to exit non-zero if the backend rejects the payload.
- GitHub Actions logs include the HTTP error plus any response body emitted by the backend.
- Because the artifact always uploads, SREs can download the JSON and replay the request
  locally while investigating failures.

## Cache Busting

- The backend uses the `id`/`slug` pair to map uploads to cached wiki routes.
- When a document's `lastUpdated` timestamp changes, downstream clients detect the new value
  and purge stale Markdown responses.
- Pokemon and move payloads immediately replace their Meilisearch indexes, so filtered
  search results reflect the regenerated manifests within the same run.


