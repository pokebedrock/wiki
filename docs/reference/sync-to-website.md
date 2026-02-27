---
title: Website Sync Pipeline
description: How GitHub pushes trigger the backend webhook and keep the public site cached.
tags:
  - reference
  - sync
lastUpdated: "2025-11-21"
status: beta
lang: en
toc: true
order: 1
---

## Overview

1. Docs merge into `main`.
2. GitHub fires a repository dispatch/webhook handled by the website backend.
3. Backend fetches the changed files via the GitHub Contents API using ETags for cache-busting.
4. Rendered HTML/MDX output is cached in Redis with a 15-minute TTL.

## Webhook Contract

| Field | Description |
| --- | --- |
| `event` | Always `wiki.synced` |
| `commit` | SHA of the merged commit |
| `files` | Array of changed doc paths |
| `timestamp` | ISO timestamp |

The backend validates the HMAC using the shared secret `WIKI_WEBHOOK_SECRET`. See
`website-backend/src/http/routes/webhooks.ts` for implementation details.

## Local Testing

Use the sample payload in `docs/reference/webhook-example.json` with `curl` or `Invoke-WebRequest`.

```powershell
Invoke-WebRequest `
  -Uri https://api.pokebedrock.com/wiki/webhook `
  -Headers @{ "X-Signature" = "<hmac>" } `
  -Body (Get-Content docs/reference/webhook-example.json -Raw) `
  -Method Post
```

## Cache Busting

- Backend stores the `ETag` returned from GitHub per file.
- On subsequent syncs, it sends `If-None-Match`; unchanged content skips re-rendering.
- When the website serves a page, it includes the doc `lastUpdated` frontmatter in the
  response to help the client decide whether to fetch fresh data.



