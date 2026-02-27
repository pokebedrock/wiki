---
title: Markdown & MDX Style Guide
description: Authoring conventions for Markdown, MDX, admonitions, and code snippets.
tags:
  - handbook
  - style-guide
lastUpdated: "2025-11-21"
status: stable
lang: en
toc: true
order: 3
---

## Formatting Rules

- Keep line length ≤ 100 characters where possible.
- Use sentence case in headings (`## Getting started`, not `## Getting Started`).
- Prefer ordered lists for sequences and unordered lists for supporting details.
- Use code fences with language hints (` ```ts `) for syntax highlighting.

## Admonitions

Use Docusaurus-style blocks:

```text
Short actionable advice.
```

Common options: `note`, `tip`, `warning`, `danger`. Import complex callouts from `docs/_partials`.

## Code Snippets

- Favor early-return patterns in pseudo-code to mirror how we write actual services.
- Keep snippets ≤ 30 lines. Split into multiple sections if longer.
- Annotate shell commands with comments when the command has side effects.

## Tables

- Align columns using Markdown pipes.
- Keep header labels concise; wrap long content to the next line instead of widening the table indefinitely.

## MDX Imports

### Auto-injected components

Components exported from `docs/snippets/` (such as `InfoCallout`, `ShellBlock`, and
`EarlyReturnExample`) are globally available in all MDX files. The website backend
registers these automatically, so you can use them without an import statement:

<InfoCallout />

<ShellBlock command="npm install" />

These should render as components, not code.

### Custom or partial imports

For components in `docs/_partials/` or one-off snippets, use explicit imports at the top
of the file:

```mdx
import ServicenodeCallout from "../_partials/ServicenodeCallout.mdx";

<ServicenodeCallout />
```

Keep imports relative to the document to avoid bundler-dependent aliases.



