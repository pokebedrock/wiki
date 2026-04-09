---
title: Documentation Changelog
description: Track significant documentation releases aligned with server updates.
tags:
  - reference
  - changelog
lastUpdated: "2026-04-09"
status: draft
lang: en
toc: true
order: 4
---

## [Unreleased]

- Placeholder entry for upcoming wiki improvements.

## [v2.4.0] - 2026-04-08

- Added an end-to-end "Website Sync Pipeline" reference that documents the backend
  endpoint contract, required secrets, and a sample multi-index payload for local
  testing.
- Mirrored the sync pipeline guidance in Spanish so both locales explain how
  Meilisearch stays private and how operators can trigger manual resyncs.
- Clarified the search-index workflow outputs, including the new move learner
  manifest that ships with the generated frontend content bundles.

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
