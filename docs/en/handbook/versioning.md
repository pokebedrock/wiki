---
title: Docs Versioning Strategy
description: Guidelines for rolling versions and changelogging major documentation updates.
tags:
  - handbook
  - versioning
lastUpdated: "2026-04-13"
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
| `vX.Y` | Major gameplay update | Annotated git tag (`wiki-vX.Y`) |
| `legacy` | Unsupported content | Archived branch or exported zip built from the tag |

> We no longer copy docs into `versions/` folders. Git tags keep immutable
> snapshots without duplicating the tree or creating extra merge debt.

## Release Flow

1. Prepare and merge changes under `docs/`.
2. Tag the release commit with an annotated tag: `git tag -a wiki-vX.Y -m "Wiki vX.Y"`.
3. Push the tag (`git push origin wiki-vX.Y`).
4. Update `docs/en/reference/changelog.md` with highlights and related issues/PRs.
5. If partners need a static artifact, run `git archive --format=zip --output wiki-vX.Y.zip wiki-vX.Y docs/` to export the tagged docs tree.
6. Search indexing keeps pointing at `main`; to review historical content, checkout the tag locally instead of rerunning the pipeline.

## Changelog

Use semantic headings:

```text
## [v2.0.0] - 2025-11-21
### Added
- ...
```

The `docs/en/reference/changelog.md` file keeps the public record synchronized with in-game releases.


