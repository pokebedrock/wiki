---
title: "Translation Workflow"
description: "Step-by-step translation process and quality gates."
tags:
  - localization
  - process
  - quality
lastUpdated: "2025-11-04"
lang: en
---

Follow this workflow to contribute translations:

1. Copy the source article into a language-specific folder and rename to `<lang>.md`.
2. Update the frontmatter `lang` and add a `source` key pointing to the original file.
3. Run `npm run lint:markdown -- docs/<category>/<slug>/<lang>.md`.
4. Request review from a native speaker and the docs team.

:::tip
For consistency, reuse glossary entries stored in `docs/snippets/glossary.md`.
:::

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent venenatis bibendum velit, ac laoreet justo condimentum sed.
