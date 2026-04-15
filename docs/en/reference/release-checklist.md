---
title: Wiki release checklist
description: Release checks for search-index generation and website sync.
tags:
  - reference
  - release
lastUpdated: "2026-04-14"
status: stable
lang: en
---

# Wiki release checklist

## Pre-Deploy

- `npm ci`
- `npm run ci`
- verify local validation passes through the standard repo gate (includes generated search/manifests checks)
- verify docs changes have valid frontmatter and media
- verify search-index CI secrets are present if website-backend sync is enabled for the target repo
- add/update the `docs/en/reference/changelog.md` entry (and localized copies) with the
  release version, date, and highlight bullets
- decide the release tag name (`wiki-vX.Y.Z`) and note it in the changelog entry before
  merge

## Publish / Sync

1. Merge docs changes to `main`.
2. Run the normal CI workflow.
3. Run (or manually dispatch) the `wiki-search` workflow for the release commit so
   Meilisearch payloads and manifests are rebuilt.
4. Confirm `build/search-index.json`, `build/search-indices.json`, and the generated
   frontend content manifests under `build/content/<locale>/` were produced.
5. If website-backend sync is enabled, confirm the backend sync endpoint accepted the new payload.
6. Create/push the Git tag noted in the changelog (for example `wiki-v2.4.0`) and
   publish/update the matching GitHub release with a link to the changelog section.

## Post-Publish

- verify wiki pages render in the frontend
- verify wiki search returns updated docs
- verify generated manifests exist for pokemon, moves, and move learners
- verify the Git tag and GitHub release reference the expected changelog entry

## Rollback

- restore the last known-good wiki commit
- rerun the search-index workflow
- verify backend search results match the restored content
- retag the release (or delete/recreate the Git tag/GitHub release) so history
  points back to the restored commit
