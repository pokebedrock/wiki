---
title: Website Sync Pipeline
description: How the wiki's search artifacts reach the website backend and Meilisearch cluster.
tags:
  - reference
  - sync
  - automation
lastUpdated: "2026-04-15"
status: stable
lang: en
toc: true
order: 1
---

## Automation Flow

1. A docs or content change merges to `main`, or the nightly schedule (`0 6 * * *`) fires.
2. `.github/workflows/search-index.yml` (`wiki-search`) checks out the repo, installs Node 20
   dependencies, and runs `npm run build:search`.
3. The build emits local artifacts under `build/` and logs a summary for traceability.
4. When both `WIKI_SEARCH_SYNC_URL` and `WIKI_SEARCH_SYNC_TOKEN` secrets are populated, the workflow
   `POST`s the generated `build/search-indices.json` payload to the website backend using a Bearer
   token.
5. If either secret is missing, the workflow explicitly logs that sync was skipped so maintainers
   know why the backend did not update.
6. Regardless of sync status, the workflow uploads the search payloads and manifests as an artifact
   named `search-index` so they can be downloaded for debugging.

### Build Outputs

`npm run build:search` runs the TypeScript scripts under `build/scripts/` and writes:

- `build/search-index.json` – flattened search dataset used for local QA
- `build/search-indices.json` – JSON object with `{ docs, pokemon, moves }` arrays consumed by both
  Meilisearch and the backend sync endpoint
- `build/content/<locale>/pokemon-manifest.json` – pre-sorted Pokémon metadata for the frontend nav
- `build/content/<locale>/moves-manifest.json` – move metadata for quick lookup
- `build/content/<locale>/move-learners-manifest.json` – derived Pokémon-by-move table for move detail
  pages

All of these files are tracked in git so `npm run check:generated` (and CI) catch drift.

## Backend Sync Contract

When the sync step runs, GitHub Actions executes the equivalent of:

```bash
curl --fail-with-body --show-error --silent \
  -X POST \
  -H "Authorization: Bearer $WIKI_SEARCH_SYNC_TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @build/search-indices.json \
  "$WIKI_SEARCH_SYNC_URL"
```

| Requirement | Details |
| --- | --- |
| Method | `POST` |
| URL | `WIKI_SEARCH_SYNC_URL` secret |
| Auth | `Authorization: Bearer ${WIKI_SEARCH_SYNC_TOKEN}` |
| Body | Exact contents of `build/search-indices.json` |
| Success | Backend returns `2xx`; workflow logs curl output |

The backend validates the bearer token, ingests the docs/moves/Pokémon arrays, and replaces the
downstream Meilisearch indexes (`wiki-docs`, `wiki-pokemon`, `wiki-moves`). A non-2xx response fails
the job so maintainers can inspect logs before retrying.

## Sample Request Body

`docs/en/reference/search-sync-example.json` contains a trimmed payload with one record per index.
Use it to familiarize yourself with the schema or to mock the backend locally.

```bash
curl -X POST \
  -H "Authorization: Bearer dev-token" \
  -H "Content-Type: application/json" \
  --data @docs/en/reference/search-sync-example.json \
  https://dev.pokebedrock.com/wiki/search-sync
```

## Local Testing

1. `npm ci`
2. `npm run build:search`
3. Inspect `build/search-indices.json` to confirm the docs, Pokémon, and move counts look
   reasonable.
4. (Optional) Set `MEILISEARCH_URL` + `MEILISEARCH_KEY` to push directly to a staging Meilisearch
   instance.
5. Use the curl command above to replay the payload against a staging backend. This mimics the GitHub Actions sync end-to-end.

## Failure & Retry Behavior

- Missing secrets ⇒ sync step logs the skip message and the run still succeeds.
- Backend returns non-2xx ⇒ workflow fails and must be re-run after the issue is corrected.
- To backfill a missed sync, trigger `wiki-search` via the **Run workflow** button in GitHub
  (`workflow_dispatch`). The job will rebuild the payloads and resend them using the latest commit
  on `main`.

## Cache & Search Expectations

- Backend imports the provided payload into its private Meilisearch cluster and immediately serves
  it to the public site.
- Frontend caches derived manifests (Pokémon, moves, move learners) in local storage; redeploys
  invalidate cache keys when `lastUpdated` timestamps change.
- If rollbacks are needed, rerun `wiki-search` from the desired commit to replace Meilisearch with
  the previous dataset.
