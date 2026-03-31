---
title: Website Sync Pipeline
description: How wiki content reaches the public website and how search indices stay current.
tags:
  - reference
  - sync
lastUpdated: "2026-03-30"
status: published
lang: en
toc: true
order: 1
---

## Overview

Wiki content reaches the website through two channels:

1. **Page rendering** — the Next.js frontend reads Markdown/MDX files directly from the local filesystem.
2. **Search indexing** — a CI workflow builds a search index and pushes it to the backend, which syncs it into Meilisearch.

## Page Rendering (Filesystem)

The frontend (`website-frontend`) reads docs from the wiki repo at the path configured via `POKEBEDROCK_WIKI_PATH` (defaults to `../wiki`). Pages are compiled from MDX at request time using `next-mdx-remote`.

In production the wiki repo is volume-mounted into the frontend container by `website-services` (`compose/stack-apps.yml`). A cron job (`scripts/sync-wiki.sh`) periodically pulls the latest commits from `main` so content stays up to date without a redeploy.

See `website-frontend/src/lib/wiki.ts` for the filesystem resolution and MDX compilation logic.

## Search Index Sync (CI → Backend → Meilisearch)

When docs or game-data assets change on `main`, the `wiki-search` GitHub Actions workflow (`.github/workflows/search-index.yml`) runs:

1. `npm run build:search` produces `build/search-indices.json` containing three collections: **docs**, **pokemon**, and **moves**.
2. The workflow `POST`s that file to the backend's internal endpoint:

```
POST /internal/wiki/search-index
Authorization: Bearer <WIKI_SEARCH_SYNC_TOKEN>
Content-Type: application/json
```

3. The backend validates the Bearer token, then syncs each collection into Meilisearch as separate indices (`wiki-docs`, `wiki-pokemon`, `wiki-moves`).

See `website-backend/src/http/routes/wiki-search-sync.ts` for the sync endpoint and `website-backend/src/http/routes/wiki-search.ts` for the public search proxy.

### Required Secrets (GitHub Actions)

| Secret | Purpose |
| --- | --- |
| `WIKI_SEARCH_SYNC_URL` | Full URL of the sync endpoint (e.g. `https://api.pokebedrock.com/internal/wiki/search-index`) |
| `WIKI_SEARCH_SYNC_TOKEN` | Bearer token shared with the backend (`WIKI_SEARCH_SYNC_TOKEN` env var) |

### Triggers

The workflow runs on:

- Push to `main` (when `docs/`, `assets/content/`, `schemas/`, or `scripts/` change)
- Manual dispatch (`workflow_dispatch`)
- Daily schedule (`0 6 * * *`)

## Local Development

In development, search falls back to a local `search-index.json` file if Meilisearch is unavailable. Build it with:

```bash
npm run build:search
```

The backend checks several candidate paths automatically (see `localWikiSearchIndexCandidates` in `wiki-search.ts`), so no extra configuration is needed when the wiki repo sits next to the backend.

