---
title: "Search Indexing"
description: "Overview of the Meilisearch indexing pipeline powered by GitHub Actions."
tags:
  - search
  - indexing
  - automation
lastUpdated: "2025-11-04"
lang: en
---

Search is provided by a self-hosted Meilisearch instance. Every push to `main` builds an index payload inside the `search-index` CI job and posts it to the sync webhook defined by `SEARCH_SYNC_WEBHOOK`.

```mermaid
flowchart TD
  A[Push to main] --> B[Lint job]
  B --> C[search-index job]
  C --> D[Tar docs directory]
  D --> E[POST gzip payload to Meilisearch webhook]
```

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce fringilla justo ac orci tincidunt, in suscipit turpis interdum.
