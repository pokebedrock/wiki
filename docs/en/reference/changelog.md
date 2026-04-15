---
title: Documentation Changelog
description: Track significant documentation releases aligned with server updates.
tags:
  - reference
  - changelog
lastUpdated: "2026-04-14"
status: draft
lang: en
toc: true
order: 4
---

## [Unreleased]

- Placeholder entry for upcoming wiki improvements.

## [v2.4.0] - 2026-04-14

- Added a dedicated docs versioning strategy (EN + ES) so contributors know when to cut
  changelog entries, release tags, and search-index reruns.
- Expanded the release checklist to require drafting the changelog entry, tagging the
  wiki release (`wiki-vX.Y.Z`), and verifying the `wiki-search` workflow artifacts
  before calling a deploy complete.
- Clarified the release flow to link backend sync verification, changelog entries, and
  search payload uploads so the website always ingests the matching content snapshot.

## [v2.3.0] - 2026-03-28

- Updated onboarding guides to align with current CI workflow steps.
- Clarified search index environment variable behavior in contribution docs.
- Aligned contribution guide with locale layout and `npm run ci` command.

## [v2.2.0] - 2026-03-09

- CI now fails when generated search artifacts (manifests, index files) drift from committed state.
- Search workflow path triggers broadened to cover shared script and build config changes.
- Default `npm run build` entrypoint added for the search index pipeline.
- Refreshed workflow details and automation references across repository documentation.
- Clarified wiki repo structure and content dataset documentation.
- Updated installation instructions to use `npm ci` for reproducible installs.

## [v2.1.0] - 2025-12-01

- Content datasets split into per-item JSON files under `assets/content/pokemon/` and `assets/content/moves/`.
- Search indexing now emits separate `docs`, `pokemon`, and `moves` payloads for Meilisearch sync.
- Frontend manifests generated: `pokemon-manifest.json`, `moves-manifest.json`, `move-learners-manifest.json`.
- ShellBlock documentation converted to MDX format.
- Search sync workflow updated to push JSON payload to website backend.

## [v2.0.0] - 2025-11-21

- Initial wiki scaffolding, linting, and CI.
- Search indexing workflow targeting Meilisearch.
- Localization workflow guide with Spanish example.
