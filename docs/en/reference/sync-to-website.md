---
title: Website Sync Pipeline
description: How the website frontend mounts the wiki repo and keeps content fresh.
tags:
  - reference
  - sync
lastUpdated: "2026-04-11"
status: beta
lang: en
toc: true
order: 1
---

## Overview

The public site no longer waits for `wiki.synced` webhooks. Instead, the
Next.js frontend keeps a local checkout of `pokebedrock/wiki` alongside the app
and renders Markdown from disk on demand (see
`website-frontend/src/lib/wiki.ts`). The runtime flow is:

1. Deployments clone (or mount) the wiki repo next to
   `website-frontend`, usually as `/srv/pokebedrock/wiki`, and set
   `POKEBEDROCK_WIKI_PATH` if the default relative path (`../wiki`) is different.
2. Route handlers call `getWikiDoc()`/`getWikiNav()` which read Markdown/MDX
   files directly from that checkout, compile them with `compileMDX`, and serve
   the rendered React tree.
3. Spanish (`es`) requests fall back to English when a translation is missing,
   mirroring the logic in `resolveDocPath()`.
4. React's `cache()` helper memoizes navigation + slug lists per web process.
   Restarting the website (or redeploying) invalidates the cache.

Because docs are served straight off disk, content updates go live as soon as
the servers pull the latest wiki commit and restart the Next.js app. No Redis or
HMAC webhook is involved anymore.

## Updating production content

To roll out new docs after merging to `main`:

1. SSH into the website host(s) and refresh the wiki checkout, for example:

   ```bash
   cd /srv/pokebedrock/wiki
   git fetch origin
   git reset --hard origin/main
   ```

2. Restart the frontend so the in-process caches drop and fresh Markdown is
   read on next request (e.g. `systemctl restart website-frontend` or redeploy
   through the orchestrator).
3. Run the wiki search-index workflow if you also need new content reflected in
   Meilisearch (see `docs/en/reference/search-indexing.md`).

## Environment variables

| Variable | Description |
| --- | --- |
| `POKEBEDROCK_WIKI_PATH` | Optional absolute path to the wiki checkout. Defaults to `../wiki` relative to the frontend app. |
| `WIKI_EDIT_BASE_URL` | Optional override for the "Edit this page" links. Defaults to `https://github.com/pokebedrock/wiki/blob/main`. |

Leave `POKEBEDROCK_WIKI_PATH` unset when deploying the wiki repo as a sibling
directory. Set it when the wiki lives elsewhere on disk (for example, when
packaging both repos into a single container image).

## Cache behavior

- `getWikiNav()` and `getAllDocSlugs()` are wrapped in React `cache()` so that a
  process only scans the filesystem once per boot.
- `getWikiDoc()` reads Markdown directly every time; no Redis layer exists.
- Restarting the website (rolling deploy or `pm2/systemd` restart) is the
  supported way to flush cached navigation metadata.

## Search + website sync

The website backend only exposes search endpoints now. To refresh search:

1. Run `npm run build:search` (or `npm run check:generated`) locally to verify
   manifests/search payloads.
2. Push to `main` and let `.github/workflows/search-index.yml` upload
   `build/search-indices.json`.
3. When `WIKI_SEARCH_SYNC_URL`/`WIKI_SEARCH_SYNC_TOKEN` are configured in the
   backend, that workflow posts the payload to `/internal/wiki/search-index`,
   allowing the backend to re-seed Meilisearch inside the cluster.


