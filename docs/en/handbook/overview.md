---
title: Wiki Overview
description: Understand the goals, scope, and structure of the PokéBedrock wiki repository.
tags:
  - handbook
  - onboarding
lastUpdated: "2025-11-21"
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
- GitHub workflows for linting, link validation, and Meilisearch indexing.
- Templates for issues, PRs, and CODEOWNERS review.

Refer to the other handbook pages for deep dives into structure, localization, and versioning.



