import { existsSync, statSync, readFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";

import { glob } from "glob";

const importRegex = /^\s*(?:import|export)\s+[^"']*?from\s+["']([^"']+)["'];?\s*$/gm;
const supportedExtensions = [".mdx", ".md", ".tsx", ".ts", ".jsx", ".js", ".json"];

const files = await glob("docs/**/*.mdx", {
  ignore: ["**/node_modules/**"]
});

if (!files.length) {
  console.log("No MDX files found under docs/ for import validation.");
  process.exit(0);
}

let hasErrors = false;

const recordError = (file: string, message: string): void => {
  hasErrors = true;
  console.error(`\n${file}: ${message}`);
};

const resolveImportTarget = (file: string, target: string): string | null => {
  const basePath = resolve(dirname(file), target);

  const candidates = new Set<string>();
  candidates.add(basePath);

  if (!extname(basePath)) {
    for (const extension of supportedExtensions) {
      candidates.add(`${basePath}${extension}`);
      candidates.add(resolve(basePath, `index${extension}`));
    }
  }

  for (const candidate of candidates) {
    if (!existsSync(candidate)) {
      continue;
    }

    try {
      if (statSync(candidate).isFile()) {
        return candidate;
      }
    } catch {
      // Ignore stat errors and keep searching.
    }
  }

  return null;
};

for (const file of files.sort((left, right) => left.localeCompare(right))) {
  const source = readFileSync(file, "utf8");

  for (const match of source.matchAll(importRegex)) {
    const target = match[1]?.trim();

    if (!target?.startsWith(".")) {
      continue;
    }

    const resolvedTarget = resolveImportTarget(file, target);

    if (resolvedTarget) {
      continue;
    }

    recordError(file, `Relative MDX import does not resolve: ${target}`);
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log(`Validated relative imports in ${files.length} MDX files.`);
