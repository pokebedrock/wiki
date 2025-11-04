# PokéBedrock Wiki Plan (Content Repo + GitHub Workflow)

- [x] Repository structure
  - [x] `/docs` root for markdown files
  - [x] Category folders with frontmatter
  - [x] `assets/` for images (webp preferred), diagrams
  - [x] Global `_meta.json` for ordering and titles

- [x] Contribution workflow
  - [x] `CONTRIBUTING.md` with authoring rules
  - [x] `PULL_REQUEST_TEMPLATE.md` and `CODEOWNERS`
  - [x] Markdown style guide and lint rules
  - [x] Issue templates (bug, content request)

- [x] Linting and validation
  - [x] markdownlint config and CI check
  - [x] Link checker (external and internal anchors)
  - [x] Frontmatter schema (title, description, tags, lastUpdated)
  - [x] Image size and alt-text enforcement

- [x] Content authoring
  - [x] MDX support
  - [x] Admonitions (note, tip, warning)
  - [x] Code blocks with syntax highlighting
  - [x] Reusable snippets/partials

- [x] Sync to website
  - [x] Backend webhook (GitHub → website) on push to `main`
  - [x] Website fetches raw markdown via GitHub API and caches
  - [x] Cache busting and ETag handling

- [x] Search
  - [x] Self-hosted Meilisearch indexing via GitHub Action

- [x] Localization
  - [x] Docs will be structured like: `/<category>/<pagename.md>` or `/<category>/<pagename>/(en/es/etc).md`
        allowing docs to be done by default in `en` but if a translator comes they the file can be moved to a folder to support multiple translations
  - [x] Translation workflow guidelines

- [x] Media handling
  - [x] Prefer `webp`, optimize on PR using CI
  - [x] Large files via Git LFS

- [x] CI
  - [x] GitHub Actions: lint, link-check, build index (if used)
  - [x] Status checks required before merge

- [x] Versioning
  - [x] Versioned docs strategy
  - [x] Changelog for major doc updates

