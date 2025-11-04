---
title: "Getting Started with PokéBedrock"
description: "Overview of the documentation stack, authoring flow, and publishing checkpoints."
tags:
  - onboarding
  - overview
  - documentation
lastUpdated: "2025-11-04"
lang: en
---

Welcome to the PokéBedrock wiki! This site curates guides, references, and best practices for building immersive Pokémon-inspired experiences on Minecraft Bedrock Edition.

:::tip Quick start
Clone the repository, run `npm install`, and try `npm run lint:markdown` to validate your first article before submitting a PR.
:::

### What lives in this repo

- Author-written documentation in Markdown and MDX under `docs/`
- Structured metadata such as `_meta.json` files to drive navigation
- Partial snippets in `docs/_partials` and `docs/snippets` for reuse across pages
- Automation scripts and GitHub Actions that keep content consistent

### Author workflow snapshot

1. Draft your article locally using the templates in `docs/snippets`.
2. Validate frontmatter and links with `npm run validate:content`.
3. Open a pull request using the pre-filled template.
4. Merge once status checks pass and the documentation team approves.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet lacus id est aliquet gravida. Vivamus finibus, nibh at auctor pulvinar, lorem felis semper turpis, eget faucibus ligula nisl quis augue.
