---
title: Running the Wiki Locally
description: Step-by-step instructions for serving docs locally in English.
tags:
  - guide
  - localization
lastUpdated: "2025-11-21"
status: beta
lang: en
toc: true
order: 2
---

## Install Dependencies

<ShellBlock command="npm install" />

## Run Linting

<ShellBlock command="npm run lint" />

The consolidated lint task runs markdown, frontmatter, and asset validation once per
execution. Re-run it after editing files; there's no watch flag wired up for the
current tooling stack.

## Preview

Until the website frontend wires up MDX rendering, preview using your favorite Markdown
viewer (VS Code, Obsidian, etc.). Once the Next.js docs portal is ready, run it against
the `docs/` directory using the `POKEBEDROCK_WIKI_PATH` env var.



