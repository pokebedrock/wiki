---
title: "Website Sync"
description: "End-to-end flow from Git push to website cache refresh."
tags:
  - sync
  - deployment
  - automation
lastUpdated: "2025-11-04"
lang: en
---

The `sync-hook` job fires after linting completes on `main`. It POSTs to `WEBSITE_SYNC_WEBHOOK`, which instructs the backend to fetch the latest markdown files using the GitHub API. The website caches responses using ETags returned from GitHub and only refreshes changed pages.

1. Push to `main` triggers CI
2. `sync-hook` sends webhook with repository and ref info
3. Backend fetches updated markdown via the GitHub REST API
4. Cached pages are revalidated using ETags

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin luctus, felis at pharetra luctus, orci augue rhoncus arcu, ac lacinia tellus leo vel arcu.
