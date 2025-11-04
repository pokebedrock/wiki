# PokéBedrock Wiki Plan (Content Repo + GitHub Workflow)

- [ ] Repository structure
  - [ ] `/docs` root for markdown files
  - [ ] Category folders with frontmatter
  - [ ] `assets/` for images (webp preferred), diagrams
  - [ ] Global `_meta.json` for ordering and titles

- [ ] Contribution workflow
  - [ ] `CONTRIBUTING.md` with authoring rules
  - [ ] `PULL_REQUEST_TEMPLATE.md` and `CODEOWNERS`
  - [ ] Markdown style guide and lint rules
  - [ ] Issue templates (bug, content request)

- [ ] Linting and validation
  - [ ] markdownlint config and CI check
  - [ ] Link checker (external and internal anchors)
  - [ ] Frontmatter schema (title, description, tags, lastUpdated)
  - [ ] Image size and alt-text enforcement

- [ ] Content authoring
  - [ ] MDX support
  - [ ] Admonitions (note, tip, warning)
  - [ ] Code blocks with syntax highlighting
  - [ ] Reusable snippets/partials

- [ ] Sync to website
  - [ ] Backend webhook (GitHub → website) on push to `main`
  - [ ] Website fetches raw markdown via GitHub API and caches
  - [ ] Cache busting and ETag handling

- [ ] Search
  - [ ] Self-hosted Meilisearch indexing via GitHub Action

- [ ] Localization
  - [ ] Docs will be structured like: `/<category>/<pagename.md>` or `/<category>/<pagename>/(en/es/etc).md`
        allowing docs to be done by default in `en` but if a translator comes they the file can be moved to a folder to support multiple translations
  - [ ] Translation workflow guidelines

- [ ] Media handling
  - [ ] Prefer `webp`, optimize on PR using CI
  - [ ] Large files via Git LFS

- [ ] CI
  - [ ] GitHub Actions: lint, link-check, build index (if used)
  - [ ] Status checks required before merge

- [ ] Versioning
  - [ ] Versioned docs strategy
  - [ ] Changelog for major doc updates

