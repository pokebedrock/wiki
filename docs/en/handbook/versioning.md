---
title: Docs Versioning Strategy
description: Guidelines for rolling versions and changelogging major documentation updates.
tags:
  - handbook
  - versioning
lastUpdated: "2026-04-14"
status: stable
lang: en
toc: true
order: 5
---

## Philosophy

We version docs when the gameplay experience or public APIs change in incompatible ways. Routine copy edits stay on the live version.

## Version Surfaces

| Surface | Trigger | Storage |
| --- | --- | --- |
| `current` | Default branch | The shared `docs/` tree on `main` |
| Release snapshot | Major gameplay update | Git tag/GitHub release for the merge commit + entry in `docs/en/reference/changelog.md` |

> ℹ️ We no longer duplicate the documentation under `versions/`.
> Git history, release tags, and the changelog are the canonical record for older content.

## Release Flow

1. Prepare changes under `docs/` on a feature branch.
2. Merge into `main` when the gameplay update (or API change) is live or scheduled.
3. Add a `## [vX.Y.Z] - YYYY-MM-DD` entry to `docs/en/reference/changelog.md` that summarizes the release and links to the rollout PR/issue.
4. Create or update the corresponding Git tag/GitHub release (for example, `wiki-v2.4.0`) so there is a permanent pointer to the merged commit.
5. Verify the `search-index` workflow finished on the tagged commit so Meilisearch/search payloads reflect the released content.

## Accessing Previous Releases

- Use `git checkout <tag>` (or the GitHub web UI) to browse a past snapshot.
- Link directly to the tag or commit in support replies when referencing legacy behavior.
- When exporting an offline copy, use the tagged commit so the archive matches the changelog entry.

## Changelog

Use semantic headings:

```text
## [v2.0.0] - 2025-11-21
### Added
- ...
```

The `docs/en/reference/changelog.md` file keeps the public record synchronized with in-game releases.

