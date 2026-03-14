---
title: Localization Workflow
description: How to structure translated docs, coordinate translators, and review localized changes.
tags:
  - handbook
  - localization
lastUpdated: "2026-03-06"
status: stable
lang: en
toc: true
order: 4
---

## File Layout

- Default English page: `docs/en/<category>/<slug>.md(x)` — use `.mdx` when the doc
  needs MDX components.
- Translated page: `docs/<lang>/<category>/<slug>.md(x)`
- Example: `docs/en/guides/running-the-server.mdx` + `docs/es/guides/running-the-server.md`

Keep slug paths identical across locales so route mapping and alternates stay stable.

## Workflow

1. **Open an issue** – use the "Content Request" template and flag it as a translation task.
2. **Create a branch** – `docs/<lang>/<slug>`.
3. **Sync with English** – translators diff against `docs/en/...` to ensure they include
   fresh changes.
4. **Run linting** – `npm run lint`.
5. **Request review** – translators tag a maintainer that speaks the language (if available) plus any subject-matter owner.

## Language Metadata

Include the `lang` property in frontmatter along with a `status` flag. Example:

```yaml
lang: es
status: beta
```

Use `draft` or `beta` for translations that still need native review.

## Glossary

Maintain terminology consistency by referencing the shared glossary in
`docs/en/reference/localization-glossary.md` (to be populated as translations expand).
When you introduce a new term, note it in the PR so others can update the glossary.



