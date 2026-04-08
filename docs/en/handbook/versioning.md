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

## Version Types

- **Live** – the `main` branch under `docs/` is always the latest public version. Every
  published page lives here and mirrors what the website renders from its sibling checkout.
- **Tagged release** – when a major gameplay update lands, tag the wiki commit (for example
  `wiki-v2.3.0`). Tags give downstream teams an immutable pointer without duplicating the tree
  inside this repo.
- **Snapshot artifact** – if compliance or downstream consumers need a frozen copy, export the
  docs via `git archive` (or attach `docs/` + `build/content/**` as a release asset). This flow
  replaces the deprecated `versions/vX.Y/` folders.

## Release Flow

1. Prepare changes under `docs/` on a feature branch and run `npm run ci`.
2. Merge to `main` once reviewers sign off.
3. Update `docs/en/reference/changelog.md` with highlights and link it to the gameplay release.
4. Tag the `main` commit (`git tag wiki-vX.Y.Z && git push origin wiki-vX.Y.Z`) when the
   corresponding in-game update ships.
5. (Optional) Attach a `git archive` or `npm run build:search` artifact to the release if another
   team needs a static snapshot.
6. Search indexing keeps the same filters; no Meilisearch changes are required because archived
   versions now live behind git tags instead of tracked folders.

## Changelog

Use semantic headings:

```text
## [v2.0.0] - 2025-11-21
### Added
- ...
```

The `docs/en/reference/changelog.md` file keeps the public record synchronized with in-game releases.



