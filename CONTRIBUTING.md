# Contributing to the PokéBedrock Wiki

Thanks for helping document PokéBedrock! This repo powers the public wiki that the
community reads, so every change should be tested and linted before merge.

## Prerequisites

- Node.js 20+
- npm 10+
- Optional: Git LFS (for large media assets)

Install dependencies:

```bash
npm ci
```

## Branch & PR Flow

1. Create a feature branch from `main`.
2. Commit focused changes (docs + assets + metadata).
3. Run `npm run check`.
4. Open a PR using the template; link any related issues.
5. At least one CODEOWNER review is required.

## Authoring Guidelines

- Every document must define the frontmatter schema located in `schemas/frontmatter.schema.json`.
- Prefer smaller, focused pages over massive guides.
- Use early returns in code snippets to match project conventions.
- Keep paragraphs short (3 sentences max) and prefer lists/tables for structured data.
- Use MDX when you need interactive snippets, imports, or layout tweaks.
- Import reusable callouts from `docs/<locale>/_partials`.

### Frontmatter Reference

```yaml
---
title: Clear Title
description: One-line summary used in search results.
tags:
  - guide
  - survival
lastUpdated: "2025-11-21"
status: stable
lang: en
---
```

- `tags` should be lowercase kebab-case.
- `lastUpdated` uses ISO dates. **Always wrap the date in quotes** so the validator treats it as a string
  (`schemas/frontmatter.schema.json` rejects YAML date objects).
- Use `status` (`draft`, `beta`, `stable`) for transparency.

### Localization

- English content lives under `docs/en/**` and Spanish content under `docs/es/**`.
- Keep identical slugs across locales so diffing stays easy (for example `docs/en/guides/getting-started.mdx` and `docs/es/guides/getting-started.mdx`).
- Add locale-specific `_meta.json` entries whenever you introduce a new page so navigation titles/descriptions stay in sync.
- Always update the English source first, then translate or open a follow-up issue when a locale needs help catching up.
- Call out notable phrasing/terminology changes in the PR description so translators know what changed.

### Media

- Add images to `assets/images` and diagrams to `assets/diagrams`.
- Commit binary assets via Git LFS when files > 1 MB.
- Only use `webp` (preferred) or `svg`. PNG/JPEG should be converted before committing.
- Provide alt text and captions where relevant.

### Content Validation

Run the following before pushing:

```bash
npm run lint
npm run lint:links
```

CI runs the same checks plus link validation and search indexing, so keeping a clean local run prevents surprises.

## Reporting Issues

- **Bug** – broken links, incorrect info, missing assets.
- **Content Request** – ideas for new guides, clarifications, or translation requests.
- Provide reproduction steps, screenshots, and suggested fixes when possible.

## Questions

Ping `@pokebedrock/wiki-maintainers` in GitHub Discussions or the docs Slack channel for help with tooling, schema updates, or localization blockers.
