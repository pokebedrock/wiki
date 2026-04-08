---
title: Docs Versioning Strategy
description: Guidelines for rolling versions and changelogging major documentation updates.
tags:
  - handbook
  - versioning
lastUpdated: "2026-04-08"
status: stable
lang: en
toc: true
order: 5
---

## Philosophy

We version docs when the gameplay experience or public APIs change in incompatible ways. Routine copy edits stay on the live version.

## Version Tracks

| Track | Trigger | Storage |
| --- | --- | --- |
| `current` | Default branch | `docs/` root (English + localized content) |
| `release` | Major gameplay update | Git tag `wiki-vX.Y` plus release artifact zip |
| `legacy` | Unsupported content | Dedicated branch (optional) or off-site archive |

Version snapshots now live in git history—**we no longer mirror docs into a `versions/`
directory.** Tags keep the repo small while still giving downstream teams a permanent
reference point for each launch.

## Release Flow

1. Prepare changes under `docs/`.
2. When the matching gameplay update ships, create a git tag
   (`git tag wiki-vX.Y && git push origin wiki-vX.Y`).
3. Generate a zip of the docs tree from that tag
   (`git archive --format zip wiki-vX.Y docs/ > wiki-vX.Y-docs.zip`) and attach it
   to the release if external teams need a frozen copy.
4. Update `docs/en/reference/changelog.md` with highlights and links back to the tag/release.
5. Ensure search indexing excludes archived versions unless explicitly requested (configure Meilisearch filters via `lang`/`status`).

## Changelog

Use semantic headings:

```text
## [v2.0.0] - 2025-11-21
### Added
- ...
```

The `docs/en/reference/changelog.md` file keeps the public record synchronized with in-game releases.
