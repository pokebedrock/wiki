# Contributing to the PokéBedrock Wiki

Thanks for helping document PokéBedrock! Follow these steps to keep the docs clean and consistent.

## 1. Set up your environment

- Install Node.js 20 LTS (`nvm use` if available)
- Run `npm install` to fetch linting and validation dependencies
- Install the recommended editor extensions in `docs/getting-started/toolchain.mdx`

## 2. Branching strategy

- Base all work on the latest `main`
- Use descriptive feature branches, e.g. `docs/add-wild-spawns-guide`
- Keep pull requests focused on a single topic or section

## 3. Writing guidelines

- Start from a template in `docs/snippets`
- Fill required frontmatter: `title`, `description`, `tags`, `lastUpdated`, `lang`
- Prefer present tense and concise headings
- Use admonitions (`:::note`, `:::warning`, etc.) for callouts
- Add alt text for any images referenced in content

## 4. Linting & validation

Run the provided scripts before opening a PR:

```bash
npm run lint:markdown
npm run validate:frontmatter
npm run check:links
```

## 5. Pull request checklist

- [ ] Frontmatter passes schema validation
- [ ] Markdown lint shows no errors or warnings
- [ ] External and internal links resolve
- [ ] Assets are optimized and stored under `docs/assets`
- [ ] Request review from `@pokedex-core`

## 6. Localization

- Place translations alongside the canonical file using language-specific filenames
- Update the `source` key in frontmatter to reference the original article

## 7. Code of conduct

Please follow the project's community guidelines (TBD) and foster a welcoming environment for contributors of all experience levels.

## 8. Required status checks

Pull requests must pass the `validate:content` workflow before merge. Sync and search jobs run automatically after merge to `main`.
