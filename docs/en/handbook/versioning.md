---
title: Docs Versioning Strategy
description: Guidelines for rolling versions and changelogging major documentation updates.
tags:
  - handbook
  - versioning
lastUpdated: "2026-04-21"
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
| `current` | Default branch | `docs/` root on `main` |
| `vX.Y` | Major gameplay update | Annotated git tag/release pointing at the snapshot commit |
| `legacy` | Unsupported content | Archived branch, git tag, or zipped export |

## Release Flow

1. Prepare changes under `docs/` on `main`.
2. Once the update ships, create a release tag for the commit that should represent the frozen docs snapshot (for example `v2.4.0`).
3. Update `docs/en/reference/changelog.md` with highlights and links to the tagged release when relevant.
4. Ensure search indexing keeps the live `main` docs current, and only index historical snapshots separately if a consumer explicitly needs them.

## Changelog

Use semantic headings:

```text
## [v2.0.0] - 2025-11-21
### Added
- ...
```

The `docs/en/reference/changelog.md` file keeps the public record synchronized with in-game releases.



