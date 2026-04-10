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
3. Run `npm run ci`.
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

- English source docs live under `docs/en/**` (for example `docs/en/guides/getting-started.mdx`).
- Spanish translations live under `docs/es/**` and should keep the same category + slug path when possible (for example `docs/es/guides/getting-started.mdx`).
- Keep the English page updated first when content changes so translators can diff against the latest source.
- Add translation context in the PR description when possible.

### Media

- Add images to `assets/images` and diagrams to `assets/diagrams`.
- Commit binary assets via Git LFS when files > 1 MB.
- Only use `webp` (preferred) or `svg`. PNG/JPEG should be converted before committing.
- Provide alt text and captions where relevant.

### Content Validation

During active edits you can use the faster authoring pass:

```bash
npm run check
```

`npm run check` bundles the markdown, frontmatter, image, and link lint steps
without rebuilding the tracked search artifacts, so it finishes quickly while
still catching most authoring mistakes.

Before pushing, run the full gate:

```bash
npm run ci
```

`npm run ci` runs the same lint + link validation steps as GitHub CI and also
verifies generated search/manifests are in sync, so it is the best local pre-push
check.

## Reporting Issues

- **Bug** – broken links, incorrect info, missing assets.
- **Content Request** – ideas for new guides, clarifications, or translation requests.
- Provide reproduction steps, screenshots, and suggested fixes when possible.

## Questions

Ping `@pokebedrock/wiki-maintainers` in GitHub Discussions or the docs Slack channel for help with tooling, schema updates, or localization blockers.
