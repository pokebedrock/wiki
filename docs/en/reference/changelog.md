---
title: Documentation Changelog
description: Track significant documentation releases aligned with server updates.
tags:
  - reference
  - changelog
lastUpdated: "2026-03-21"
status: draft
lang: en
toc: true
order: 4
---

## [Unreleased]

### Added

- Search-index drift detection in CI (`check:generated`) so stale generated
  artifacts fail the pipeline automatically.
- `npm run build` alias for easier local development.
- `npm audit` step in CI to surface dependency vulnerabilities early.
- Bot-setup docs rendered as MDX with `ShellBlock` component.

### Fixed

- Onboarding guides aligned with the current `npm run ci` workflow.
- CONTRIBUTING.md localization paths and CI command updated to match repo
  layout.
- DOCUMENTATION.md refreshed with accurate repository map and search-workflow
  references.
- Search index environment-variable docs corrected.
- Stale translation-label instructions removed from Spanish PR template.
- `wiki-search` CI path filters widened to cover script and build-config
  changes.

## [v2.0.0] — 2025-11-21

- Initial wiki scaffolding, linting, and CI.
- Search indexing workflow targeting Meilisearch.
- Localization workflow guide with Spanish example.
