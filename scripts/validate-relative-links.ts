import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { glob } from "glob";

const files = await glob("{README.md,CONTRIBUTING.md,DOCUMENTATION.md,docs/**/*.{md,mdx}}", {
  ignore: ["**/node_modules/**", "**/build/**"]
});

if (!files.length) {
  console.log("No markdown files found for relative link validation.");
  process.exit(0);
}

const markdownLinkRegex = /(?<!! )\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const htmlHrefRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;

let hasErrors = false;

const recordError = (file: string, target: string, message: string): void => {
  hasErrors = true;
  console.error(`\n${file}: ${message}: ${target}`);
};

const isSkippableTarget = (target: string): boolean =>
  target.startsWith("http://") ||
  target.startsWith("https://") ||
  target.startsWith("mailto:") ||
  target.startsWith("tel:") ||
  target.startsWith("#") ||
  target.startsWith("data:");

const normalizeTargetPath = (file: string, rawTarget: string): string => {
  const [pathOnly] = rawTarget.split("#", 1);
  return resolve(dirname(file), pathOnly);
};

const validateTarget = (file: string, rawTarget: string): void => {
  const target = rawTarget.trim();

  if (!target || isSkippableTarget(target)) {
    return;
  }

  const absolutePath = normalizeTargetPath(file, target);

  if (!existsSync(absolutePath)) {
    recordError(file, target, "Referenced relative link not found");
    return;
  }

  try {
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      recordError(file, target, "Relative link resolves to a directory, not a file");
    }
  } catch {
    recordError(file, target, "Unable to stat referenced relative link");
  }
};

for (const file of files.sort((left, right) => left.localeCompare(right))) {
  const source = readFileSync(file, "utf8");

  markdownLinkRegex.lastIndex = 0;
  for (const match of source.matchAll(markdownLinkRegex)) {
    const [, target] = match;
    if (target) {
      validateTarget(file, target);
    }
  }

  htmlHrefRegex.lastIndex = 0;
  for (const match of source.matchAll(htmlHrefRegex)) {
    const [, target] = match;
    if (target) {
      validateTarget(file, target);
    }
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log(`Relative link validation succeeded for ${files.length} markdown files.`);
