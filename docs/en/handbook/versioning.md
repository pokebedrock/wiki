---
title: Docs Versioning Strategy
description: Guidelines for rolling versions and changelogging major documentation updates.
tags:
  - handbook
  - versioning
lastUpdated: "2026-03-21"
status: stable
lang: en
toc: true
order: 5
---

## Philosophy

We version docs when the gameplay experience or public APIs change in incompatible ways. Routine copy edits stay on the live version.

## Version Types

| Version | Trigger | Storage |
| --- | --- | --- |
| `current` | Default branch | `docs/` root |
| `vX.Y` | Major gameplay update | `versions/vX.Y/` (mirrors structure) |
| `legacy` | Unsupported content | Archived branch or zipped export |

## Release Flow

1. Prepare changes under `docs/`.
2. Once the update ships, copy the folder into `versions/vX.Y/` and freeze.
3. Update `docs/en/reference/changelog.md` with highlights and links.
4. Ensure search indexing excludes archived versions unless explicitly requested (configure Meilisearch filter).

## Changelog

Use semantic headings:

```text
## [v2.0.0] - 2025-11-21
### Added
- ...
```

The `docs/en/reference/changelog.md` file keeps the public record synchronized with in-game releases.



