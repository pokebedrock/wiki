---
title: Wiki Overview
description: Understand the goals, scope, and structure of the PokéBedrock wiki repository.
tags:
  - handbook
  - onboarding
lastUpdated: "2026-04-15"
status: stable
lang: en
toc: true
order: 1
---

The PokéBedrock wiki centralizes all public documentation for the project. This repository serves three purposes:

1. Give contributors a predictable place to propose doc changes.
2. Provide automation hooks (linting, link checking, search indexing).
3. Feed the public-facing website through a sync pipeline.

## Key Principles

- **Source of truth** – Treat `main` as the canonical content state.
- **Automation first** – Every rule worth documenting should be enforced by a script or CI job.
- **Inclusive authoring** – Markdown by default, MDX when needed, and localization support that grows with the community.

## Repo Highlights

- Structured `docs/` tree with `_meta.json` for ordering.
- Shared `assets/` folder with LFS guidance for large binary files.
- JSON Schema–validated frontmatter that keeps metadata consistent.
- Generated search payloads (`build/search-index.json`, `build/search-indices.json`, and the manifests under `build/content/<locale>/`)
  are tracked in git so `npm run check:generated` catches drift before merge.
- GitHub workflows for linting, link validation, and Meilisearch indexing.
- Templates for issues, PRs, and CODEOWNERS review.

## Automation & Releases

- `npm run check:generated` rebuilds the search payloads/manifests listed above and fails CI when the committed copies fall out of sync,
  preventing stale data from reaching the website.
- The `wiki-search` workflow reruns after every merge to `main` (and nightly) to publish the same payload set. When `WIKI_SEARCH_SYNC_URL` +
  `WIKI_SEARCH_SYNC_TOKEN` are configured, the job also POSTs the combined payload to the website backend so Meilisearch stays aligned with
  the repo snapshot.
- Changelog entries plus Git tags named `wiki-vX.Y.Z` document each release, giving support a stable pointer while keeping the public site
  in lockstep with what was indexed.

Refer to the other handbook pages for deep dives into structure, localization, versioning, and release governance.
