---
title: Website Sync Pipeline
description: How the wiki-search workflow publishes fresh content payloads to the website backend.
tags:
  - reference
  - sync
lastUpdated: "2026-04-15"
status: beta
lang: en
toc: true
order: 1
---

## Overview

The wiki no longer sends per-commit webhooks. All publishing now rides on the
`wiki-search` GitHub Actions workflow defined in `.github/workflows/search-index.yml`:

1. Triggers: push events to `main` that touch docs/content/schema assets,
   nightly at 06:00 UTC, or manual dispatches.
2. The workflow runs `npm ci` followed by `npm run build:search`, which emits:
   - `build/search-index.json` (merged index for offline/local debugging)
   - `build/search-indices.json` (multi-index payload with `docs`, `pokemon`,
     and `moves` arrays)
   - Localized manifests in `build/content/<locale>/`
     (`pokemon-manifest.json`, `moves-manifest.json`,
     `move-learners-manifest.json`).
3. Artifacts from step 2 are always uploaded as `search-index` so failed syncs
   can still be inspected.
4. When the backend sync secrets are present, the workflow `POST`s
   `build/search-indices.json` directly to the website backend. Otherwise it
   logs that sync was skipped and exits successfully after artifact upload.

This design keeps Meilisearch closed to the internet. GitHub creates the
payload, but only the backend can import it because the endpoint lives on the
private network.

## Required Secrets

- `WIKI_SEARCH_SYNC_URL`: HTTPS endpoint exposed by the website backend (for
  example `https://api.pokebedrock.com/wiki/search-sync`).
- `WIKI_SEARCH_SYNC_TOKEN`: Bearer token the backend validates before accepting
  a payload.

If either secret is missing, the sync step is skipped (artifact upload still
runs). When both are set, the workflow treats sync as mandatory—`curl
--fail-with-body` will stop the job if the backend rejects the payload.

## Backend Contract

- Method: `POST`
- URL: `WIKI_SEARCH_SYNC_URL`
- Headers:
  - `Authorization: Bearer <WIKI_SEARCH_SYNC_TOKEN>`
  - `Content-Type: application/json`
- Body: raw JSON identical to `build/search-indices.json`

The JSON payload has the following top-level keys:

```json
{
  "docs": [
    {
      "id": "en/guides/getting-started",
      "slug": "guides/getting-started",
      "title": "…"
    }
  ],
  "pokemon": [
    {
      "id": "content/en/pokemon/bulbasaur",
      "slug": "content/pokemon/bulbasaur",
      "tags": ["content", "pokemon", "grass", "poison"]
    }
  ],
  "moves": [
    {
      "id": "content/en/moves/vine-whip",
      "slug": "content/moves/vine-whip",
      "tags": ["content", "moves", "grass", "physical"]
    }
  ]
}
```

Each record mirrors the schema documented in
[Search Indexing](./search-indexing.md): `id`, `slug`, `title`, `description`,
`tags`, `status`, `lang`, `order`, and `body`. The backend fans the arrays out
to the Meilisearch indices (`wiki-docs`, `wiki-pokemon`, `wiki-moves`) and
purges any stale data before inserting the new documents.

## Local Testing

Use the canned payload in `docs/en/reference/search-sync-example.json` to
simulate a sync without touching the GitHub workflow:

```bash
curl --fail --show-error --silent \
  -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  --data-binary @docs/en/reference/search-sync-example.json \
  https://api.pokebedrock.com/wiki/search-sync
```

To regenerate the payload locally, run `npm run build:search` and point
`--data-binary` at the resulting `build/search-indices.json`.

## Failure Handling & Observability

- The workflow always uploads the search artifacts, even when sync fails.
  Download `search-index.zip` from the Actions run to inspect the payloads.
- `curl --fail-with-body` surfaces backend validation errors (HTTP ≥400)
  directly in the job log.
- Backend logs should record who initiated the sync (GitHub Actions) and
  whether token validation passed. Pair this with Sentry breadcrumbs in the
  website backend when diagnosing production discrepancies.

If the backend cannot accept new payloads (maintenance, deploy freeze, etc.),
remove or blank the secrets so the workflow safely skips sync until the
endpoint is ready again.

