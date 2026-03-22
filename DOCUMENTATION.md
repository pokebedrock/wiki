# PokéBedrock Wiki Documentation

This file documents the tracked repository contents: purpose, structure, and the role of each part.

## 1. Scope and conventions

- Scope of this document: repository-tracked files returned by `git ls-files`.
- Not documented file-by-file: local/runtime artifacts such as `.git/`, `node_modules/`, and generated `build/` output.
- Primary content source: `docs/` (Markdown/MDX).
- Governance and automation source: root configs, `scripts/`, `schemas/`, and `.github/`.

## 2. High-level architecture

- Authors write docs in `docs/<locale>/**/*.md` and `docs/<locale>/**/*.mdx`.
- Frontmatter is validated against `schemas/frontmatter.schema.json`.
- Markdown, links, frontmatter, and media are validated via `npm` scripts.
- CI (`.github/workflows/ci.yml`) runs on every push and pull request in this repository.
- Search index is generated from docs by `scripts/build-search-index.ts` and can be pushed to Meilisearch.
- Website sync behavior is specified in docs (`docs/reference/sync-to-website.md`) and example payload (`docs/reference/webhook-example.json`).

## 3. Directory map

```text
.
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
├── assets/
│   ├── content/
│   ├── diagrams/
│   └── images/
├── docs/
│   ├── en/
│   └── es/
├── schemas/
├── scripts/
└── root configs, metadata, and package scripts
```

## 4. Root files

### Governance and onboarding

- `README.md`: main project overview, quickstart, layout, tooling, CI/deployment summary.
- `CONTRIBUTING.md`: contributor workflow, authoring rules, localization/media guidance, validation commands.
- `DOCUMENTATION.md`: this living inventory of the repo (replaces the deprecated `PLAN.md`).
- `CODEOWNERS`: assigns repository ownership to `@pokebedrock/wiki-maintainers`.

### Tooling and package management

- `package.json`:
  - Requires Node `>=20` and npm `>=10`.
  - Defines scripts for markdown lint, frontmatter validation, image checks, link checks, combined checks, and search build.
  - Uses TypeScript + Node scripts (`scripts/*.ts`) compiled to `build/scripts`.
- `package-lock.json`: lockfile for reproducible dependency resolution.
- `tsconfig.json`: TypeScript config for script source (`scripts/**/*.ts`) with `noEmit: true`.
- `tsconfig.build.json`: extends base config, enables emit into `build/scripts`.
- `linkinator.config.json`: link-check retry/timeout behavior and skipped schemes.

### Lint and ignore config

- `.gitignore`: ignores OS junk, caches, build outputs, logs, and dependency folders.
- `.markdownlint.json`:
  - Enables markdownlint defaults with specific overrides.
  - Sets line-length behavior and several rule toggles.
  - Note: `MD033` appears twice; final value is `false` (effectively disables that rule).
- `.markdownlintignore`: excludes `node_modules`, `coverage`, `dist`, and `build` from markdown linting.

## 5. GitHub configuration (`.github/`)

### Issue and PR templates

- `.github/ISSUE_TEMPLATE/bug-report.md`: structured form for doc bugs (broken links, outdated content, missing assets).
- `.github/ISSUE_TEMPLATE/content-request.md`: structured form for new/improved docs and localization requests.
- `.github/ISSUE_TEMPLATE/config.yml`: disables blank issues; points users to support URL for non-docs issues.
- `.github/PULL_REQUEST_TEMPLATE.md`: PR checklist for docs/assets/localization/testing.

### Workflows

- `.github/workflows/ci.yml` (`wiki-ci`):
  - Triggers on every pull request and push.
  - Uses Node 20 with npm cache restoration.
  - Executes `npm ci`, `npm run ci` (lint + links + search build), and `npm run audit:prod`.
- `.github/workflows/search-index.yml` (`wiki-search`):
  - Triggers on pushes to `main` for docs/content/schema/search-build paths, manual dispatch, and daily schedule.
  - Builds search index via `npm run build:search`.
  - Uploads both `build/search-index.json` and `build/search-indices.json` as artifacts.
  - Sends the multi-index JSON payload to the website backend sync endpoint using:
    - `WIKI_SEARCH_SYNC_URL`
    - `WIKI_SEARCH_SYNC_TOKEN`
  - Path filter watches `scripts/build-search-index.ts`, matching the TypeScript source emitted into `build/scripts` during CI.

## 6. Assets (`assets/`)

- `assets/README.md`: policy summary for media placement and formats.
- `assets/images/.gitkeep`: keeps empty `images/` directory tracked.
- `assets/diagrams/.gitkeep`: keeps empty `diagrams/` directory tracked.

Media policy from docs/scripts:

- Preferred formats: `.webp`, `.svg`.
- Inline image size limit validated at `<= 600 KB`.
- Large binaries should use Git LFS (as described in contributing/reference docs).

## 7. Schema (`schemas/`)

- `schemas/frontmatter.schema.json`: JSON Schema for docs frontmatter.
  - Required keys: `title`, `description`, `tags`, `lastUpdated`.
  - Optional keys include `status`, `lang`, `toc`, `order`.
  - Constraints include string lengths, tag format, ISO date format, and enum values.
  - `additionalProperties: true` allows extension fields.

## 8. Scripts (`scripts/`)

- `scripts/validate-frontmatter.ts`:
  - Loads schema from `schemas/frontmatter.schema.json`.
  - Parses frontmatter with `gray-matter`.
  - Validates each doc with `ajv`.
  - Fails with per-file, per-field errors on schema mismatch.
- `scripts/check-images.ts`:
  - Scans docs for Markdown and HTML image references.
  - Enforces descriptive alt text.
  - Enforces local image existence (unless external URL).
  - Enforces extension whitelist (`.webp`, `.svg`) and max size (`600 KB`).
- `scripts/build-search-index.ts`:
  - Scans docs (excluding `_partials` and `snippets`).
  - Parses frontmatter + content and writes:
    - `build/search-index.json` (merged local fallback)
    - `build/search-indices.json` (docs/pokemon/moves split payload)
    - `build/content/<locale>/pokemon-manifest.json` (frontend Pokemon summaries)
    - `build/content/<locale>/moves-manifest.json` (frontend move summaries)
    - `build/content/<locale>/move-learners-manifest.json` (frontend move learner lookup)
  - Reads content JSON from:
    - `assets/content/<locale>/pokemon/*.json`
    - `assets/content/<locale>/moves/*.json`
  - Optionally pushes documents to Meilisearch when env vars are provided:
    - `MEILISEARCH_URL`
    - `MEILISEARCH_KEY`
  - Pushes three indices:
    - `wiki-docs`
    - `wiki-pokemon`
    - `wiki-moves`
  - Production CI instead sends the generated multi-index payload to the backend, which reindexes Meilisearch internally.
- `scripts/split-content-data.ts`:
  - Splits legacy monolithic content JSON into per-item files.
  - Writes Pokemon files to `assets/content/<locale>/pokemon/`.
  - Writes move files to `assets/content/<locale>/moves/`.

## 9. Docs content (`docs/`)

### Category metadata

- `docs/<locale>/_meta.json`: declares top-level categories (`handbook`, `guides`, `reference`, `snippets`) with title, description, and order.

### Handbook pages

- `docs/<locale>/handbook/overview.md`: mission, principles, and repository goals.
- `docs/<locale>/handbook/repo-structure.md`: folder breakdown and automation notes.
- `docs/<locale>/handbook/style-guide.mdx`: Markdown/MDX conventions and snippet usage.
- `docs/<locale>/handbook/localization.md`: translation layout/workflow/review expectations.
- `docs/<locale>/handbook/versioning.md`: docs versioning strategy and release flow.

### Guides

- `docs/<locale>/guides/getting-started.mdx`: onboarding flow for first contribution; uses imported snippet components.
- `docs/en/guides/running-the-server.mdx`: English guide for local setup/lint/preview notes.
- `docs/es/guides/running-the-server.md`: Spanish translation for local workflow.

### Reference pages

- `docs/<locale>/reference/sync-to-website.md`: webhook-driven sync design, cache behavior, local test example.
- `docs/<locale>/reference/search-indexing.md`: local and CI indexing behavior for Meilisearch integration.
- `docs/<locale>/reference/media-policy.mdx`: format, size, alt-text, and LFS rules.
- `docs/<locale>/reference/changelog.md`: release-aligned documentation changelog.
- `docs/<locale>/reference/localization-glossary.md`: shared terminology for translators.
- `docs/<locale>/reference/webhook-example.json`: example webhook payload for local testing.

### Reusable MDX building blocks

- `docs/<locale>/snippets/callouts.mdx`: exports reusable callout components (`InfoCallout`, `WarningCallout`).
- `docs/<locale>/snippets/code-blocks.mdx`: exports `ShellBlock` and `EarlyReturnExample` components.
- `docs/<locale>/_partials/ReleaseChecklist.mdx`: reusable release checklist block.

## 10. Operational workflow summary

### Authoring workflow

1. Create/edit docs under `docs/`.
2. Include valid frontmatter matching schema.
3. Add images/diagrams under `assets/` with relative references.
4. Reuse snippets/partials for consistency.

### Validation workflow

1. `npm run lint:md` for markdown rules.
2. `npm run lint:frontmatter` for schema compliance.
3. `npm run lint:images` for media checks.
4. `npm run lint:links` for broken links.
5. `npm run check` to run the fast local validation suite (`lint` + link checks).
6. `npm run ci` to mirror the main generated-artifact gate before opening a PR.

### CI workflow

- `wiki-ci` runs `npm run ci` and `npm run audit:prod` on push/PR.
- `wiki-search` builds search index on main/schedule/manual and publishes artifact.

### Search workflow

1. Build script generates search payloads plus frontend content manifests in `build/`.
2. If Meilisearch credentials exist, records are pushed remotely.
3. Schema includes metadata and body text for ranking and filtering.

### Website sync workflow

1. Docs merge to `main`.
2. Backend receives webhook/dispatch event.
3. Changed files are fetched through GitHub API with ETag caching.
4. Rendered docs are cached by backend for serving.

## 11. Notes on non-source directories

- `.git/`: local repository internals; not part of authored documentation.
- `node_modules/`: installed dependencies from `package-lock.json`.
- `build/`: generated JS/source maps and generated search index output.

These directories are expected runtime artifacts for development/CI, not hand-authored wiki source.
