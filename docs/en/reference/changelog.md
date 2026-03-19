---
title: Documentation Changelog
description: Track significant documentation releases aligned with server updates.
tags:
  - reference
  - changelog
lastUpdated: "2026-03-19"
status: stable
lang: en
toc: true
order: 4
---

## [Unreleased]

- Placeholder entry for upcoming wiki improvements.

## [v2.1.0] - 2026-03-19

### Added (v2.1.0)

- Spanish-localized guides, reference docs, and release checklists that stay in
  lockstep with the English originals.
- Default `npm run build` alias to keep local preview tools aligned with the
  Meilisearch search-index workflow triggers.

### Changed (v2.1.0)

- Updated onboarding and running-locally guides to center on `npm run ci`, so
  contributors always run lint, link, and generated-file drift checks before
  sending a PR.
- Refreshed repo-structure and contribution docs to explain the locale-specific
  folder layout and clarify how localization reviews flow through CODEOWNERS.
- Documented the search-index environment requirements and website sync webhook
  so ops knows when to set `MEILISEARCH_URL/KEY` for manual rebuilds.

### Fixed (v2.1.0)

- Patched MDX shell block rendering so inline commands and callouts lint clean
  across locales.
- Clarified the release checklist order to reduce false positives in search
  index drift detection.


## [v2.0.0] - 2025-11-21

### Added (v2.0.0)

- Initial wiki scaffolding, linting, and CI.
- Search indexing workflow targeting Meilisearch.
- Localization workflow guide with Spanish example.



