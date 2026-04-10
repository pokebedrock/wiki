---
title: Website Sync Pipeline
description: How the wiki-search workflow posts fresh search payloads to the website backend.
tags:
  - reference
  - sync
lastUpdated: "2026-04-10"
status: beta
lang: en
toc: true
order: 1
---

## Workflow Overview

1. Changes that touch docs, localized content, schemas, or build tooling land on `main`.
2. The `wiki-search` GitHub Actions workflow (`.github/workflows/search-index.yml`) runs on
   every push to `main`, on manual dispatch, and nightly at 06:00 UTC.
3. The workflow installs Node 20, runs `npm ci`, and executes `npm run build:search`.
4. `npm run build:search` produces `build/search-index.json`, `build/search-indices.json`, and the
   localized manifests under `build/content/<locale>/` for Pokémon, moves, and move learners.
5. The workflow always uploads those artifacts so reviewers can inspect the payloads even if
   backend credentials are absent.
6. When secrets are configured, the workflow posts the multi-index JSON payload to the website
   backend so it can refresh the private Meilisearch cluster.

## Backend Sync Contract

When both `WIKI_SEARCH_SYNC_URL` and `WIKI_SEARCH_SYNC_TOKEN` are defined, the _Sync search index via
website backend_ step runs. The request looks like this:

| Item | Value |
| --- | --- |
| Method | `POST` |
| URL | Value of `WIKI_SEARCH_SYNC_URL` |
| Headers | `Authorization: Bearer <WIKI_SEARCH_SYNC_TOKEN>`, `Content-Type: application/json` |
| Body | Contents of `build/search-indices.json` (see `docs/en/reference/webhook-example.json` for a trimmed sample) |

The backend validates the bearer token before streaming the payload into Meilisearch. Each payload
contains three arrays: `docs`, `pokemon`, and `moves`. Every array entry already matches the schema
documented in [Search Indexing](./search-indexing.md), so the backend only needs to forward the data
to the internal `wiki-*` indices.

When either secret is missing, the workflow prints a skipped-sync note and still publishes the build
artifacts. This allows staging environments to run safely without write credentials.

## Local Testing

1. Run `npm run build:search` so the latest payloads exist under `build/`.
2. Use `curl` (or PowerShell's `Invoke-WebRequest`) to mimic the GitHub Actions request:

```bash
curl --fail --show-error --silent \
  -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  --data-binary @build/search-indices.json \
  https://api.pokebedrock.com/wiki/search-sync
```

For testing without rebuilding the dataset, you can also post the trimmed example payload in
`docs/en/reference/webhook-example.json`.

## Rollback and Replays

- Re-run the `wiki-search` workflow against the last known-good commit (or manually upload the
  artifacts) to regenerate the search payloads.
- Trigger a manual workflow dispatch once the rollback commit is on `main` to resend the payload to
  the backend.
- If Meilisearch needs to be reseeded without new docs, dispatch the workflow and supply an
  override commit SHA so reviewers can trace what data was imported.


