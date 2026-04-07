---
title: Website Sync Pipeline
description: How GitHub pushes trigger the backend webhook and keep the public site cached.
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

1. Docs merge into `main`.
2. The `wiki-search` workflow builds the docs search payload plus every locale manifest via
   `npm run build:search`.
3. The workflow always uploads the generated artifacts. When `WIKI_SEARCH_SYNC_URL` **and**
   `WIKI_SEARCH_SYNC_TOKEN` are set, it also `POST`s `build/search-indices.json` to the website
   backend.
4. The backend authenticates the request, replaces the Meilisearch indices (`wiki-docs`,
   `wiki-pokemon`, `wiki-moves`), then invalidates cached wiki responses so the public site serves
   the refreshed content.

This flow replaces the legacy `wiki.synced` webhook. Search + manifest data now flows one
way—from CI to the website backend—so deployments only need GitHub credentials and the backend
URL/token.

## Sync Endpoint Contract

- **Method**: `POST`
- **URL**: `WIKI_SEARCH_SYNC_URL`
- **Headers**:
  - `Authorization: Bearer <WIKI_SEARCH_SYNC_TOKEN>`
  - `Content-Type: application/json`
- **Body**: the full contents of `build/search-indices.json`

The backend expects the entire dataset on every call (not just changed files) so it can replace its
Meilisearch indices atomically.

## Payload Schema

`build/search-indices.json` is a JSON object with three arrays: `docs`, `pokemon`, and `moves`.
Every entry matches the search record structure below.

| Field | Description |
| --- | --- |
| `id` | Stable identifier (`en/reference/release-checklist`, `content/en/pokemon/pikachu`, etc.). |
| `slug` | URL slug relative to the wiki root or content bucket. |
| `title` | Rendered title used for display + ranking. |
| `description` | Short summary shown in search results. |
| `tags` | Normalized tags (`guide`, `content`, `electric`). |
| `lastUpdated` | ISO timestamp from frontmatter when available. |
| `status` | `draft`, `beta`, or `stable`. |
| `lang` | Locale code (`en`, `es`). |
| `order` | Numeric sort weighting (docs first, then pokemon, then moves). |
| `body` | Markdown/MDX body text or synthesized summary for content datasets. |

### Example Payload

See `docs/en/reference/webhook-example.json` for a truncated sample that matches the current schema
without uploading the full repo contents.

## Local Testing

```bash
curl --fail-with-body --show-error --silent \
  -X POST \
  -H "Authorization: Bearer $WIKI_SEARCH_SYNC_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @docs/en/reference/webhook-example.json \
  "$WIKI_SEARCH_SYNC_URL"
```

The backend should respond with `200 OK`. Any non-2xx response causes the GitHub Actions step to
fail so the run surfaces in CI.

## Failure + Retry Guidance

- **4xx** responses usually mean the bearer token is invalid or missing. Rotate
  `WIKI_SEARCH_SYNC_TOKEN` and rerun the workflow.
- **5xx** responses come from the backend or Meilisearch. Rerun the job once the service
  recovers; the workflow will rebuild the payload before retrying.
- **Timeouts**: GitHub cancels the request after ~360 seconds. The backend should stream progress
  logs so failures include enough context.

## Cache Busting

- After a successful sync the backend refreshes Meilisearch and warms wiki caches for the updated
  slugs.
- Frontend clients rely on the `lastUpdated` field surfaced in API responses to decide whether to
  fetch fresh Markdown.
- When a sync fails, the previously indexed data remains in place—the workflow never partially
  updates the indices.

