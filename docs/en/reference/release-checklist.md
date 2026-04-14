---
title: Wiki release checklist
description: Release checks for search-index generation and website sync.
tags:
  - reference
  - release
lastUpdated: "2026-04-14"
status: stable
lang: en
---

# Wiki release checklist

## Pre-Deploy

- `npm ci`
- `npm run ci`
- verify local validation passes through the standard repo gate (includes generated search/manifests checks)
- verify docs changes have valid frontmatter and media
- verify `MEILISEARCH_URL` and `MEILISEARCH_KEY` exist (local `.env` or CI secrets)
  so `npm run build:search` can push fresh data to Meilisearch when needed
- verify `WIKI_SEARCH_SYNC_URL` and `WIKI_SEARCH_SYNC_TOKEN` GitHub secrets are present
  if website-backend sync is enabled for the target repo

## Publish / Sync

1. Merge docs changes to `main`.
2. Run the normal CI workflow.
3. Run the search-index workflow if a manual rebuild is needed.
4. Confirm `build/search-index.json`, `build/search-indices.json`, and the
   generated frontend content manifests under `build/content/<locale>/` were
   produced.
5. Review the `search-index` workflow logs: when `WIKI_SEARCH_SYNC_URL/TOKEN` are set,
   the "Sync backend payload" step should report HTTP 2xx; when unset, the logs should
   explicitly state the sync step was skipped.
6. If website-backend sync is enabled, confirm the backend sync endpoint accepted the new payload.

## Post-Publish

- verify wiki pages render in the frontend
- verify wiki search returns updated docs
- verify generated manifests exist for pokemon, moves, and move learners

## Rollback

- restore the last known-good wiki commit
- rerun the search-index workflow
- verify backend search results match the restored content
