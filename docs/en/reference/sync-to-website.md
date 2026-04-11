---
title: Website Sync Pipeline
description: How the wiki-search workflow hands search payloads to the website backend.
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

The website no longer polls GitHub for changed Markdown. Instead, the
`wiki-search` workflow (`.github/workflows/search-index.yml`) builds the search
payload plus frontend manifests and POSTs them directly to the website backend.

Workflow trigger summary:

1. Pushes to `main` that touch docs, schemas, scripts, or build config.
2. Manual `workflow_dispatch` runs for hotfixes.
3. A nightly cron (`0 6 * * *`) to keep Meilisearch fresh even if no commits
   landed that day.

Each run performs:

| Step | Description |
| --- | --- |
| Install | `npm ci` on Node 20 with npm cache reuse. |
| Build | `npm run build:search` produces `build/search-indices.json`, the frontend manifests under `build/content/<locale>/`, and the merged `build/search-index.json` fallback. |
| Sync | When sync secrets exist, the job POSTs `build/search-indices.json` to the website backend via HTTPS. |
| Artifact | The raw JSON outputs upload as an Actions artifact for audit trails and manual replays. |

## Required Secrets

| Secret | Description |
| --- | --- |
| `WIKI_SEARCH_SYNC_URL` | HTTPS endpoint exposed by the website backend (for example `https://api.pokebedrock.com/wiki/search-sync`). |
| `WIKI_SEARCH_SYNC_TOKEN` | Bearer token validated by the backend before accepting a payload. |

If either secret is blank the workflow still builds artifacts but logs that the
backend sync was skipped.

## HTTP Contract

The sync step issues:

```bash
curl --fail-with-body --silent --show-error \
  -X POST \
  -H "Authorization: Bearer $WIKI_SEARCH_SYNC_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @build/search-indices.json \
  "$WIKI_SEARCH_SYNC_URL"
```

- `Content-Type` must remain `application/json`.
- The Authorization header contains the raw token (no HMAC). Rotate the token in
  both repos when access changes.
- The POST body is exactly the contents of `build/search-indices.json`.

## Payload Shape

`docs/en/reference/webhook-example.json` mirrors a trimmed payload. The top-level
keys represent individual Meilisearch indexes:

| Key | Example Index |
| --- | --- |
| `docs` | Markdown/MDX pages rendered into search documents. |
| `pokemon` | Generated Pokédex entries sourced from `assets/content`. |
| `moves` | Generated move detail entries sourced from `assets/content`. |

Each entry contains the search metadata (`id`, `slug`, `title`, `description`,
`tags`, `status`, `lang`, `order`, and `body`). The backend streams the payload
into the internal Meilisearch cluster, replacing the entire index on each run.

## Cache & Website Invalidation

After ingesting the payload the backend:

1. Rebuilds the `wiki-docs`, `wiki-pokemon`, and `wiki-moves` indexes inside the
   private Meilisearch instance.
2. Invalidates the website cache for the affected docs so the frontend fetches
   fresh search results immediately.
3. Exposes the merged `build/search-index.json` artifact to the frontend as a
   fallback when Meilisearch is unavailable.

This flow eliminates the legacy GitHub Contents polling and keeps the public
site aligned with the exact data the CI run validated.

