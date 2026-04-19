import { readFileSync, statSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";

import { glob } from "glob";

const allowedExtensions = new Set<string>([".webp", ".svg"]);
const maxSizeBytes = 600 * 1024; // 600 KB

const docs = await glob("docs/**/*.{md,mdx}", {
  ignore: ["**/_partials/**", "**/node_modules/**"]
});

if (!docs.length) {
  console.log("No markdown files found under docs/ for image validation.");
  process.exit(0);
}

const markdownImageRegex = /!\[([^\]]*)]\(([^)]+)\)/g;
const htmlImageRegex = /<img\s+[^>]*>/gi;
const srcRegex = /src=["']([^"']+)["']/i;
const altRegex = /alt=["']([^"']*)["']/i;

let hasErrors = false;

const recordError = (file: string, message: string): void => {
  hasErrors = true;
  console.error(`\n${file}: ${message}`);
};

const isExternal = (target: string): boolean =>
  target.startsWith("http://") || target.startsWith("https://");

const validateAsset = (file: string, target: string, altText?: string): void => {
  if (!altText?.trim() || altText.trim().toLowerCase() === "image") {
    recordError(file, `Missing descriptive alt text for ${target}`);
  }

  if (isExternal(target)) {
    return;
  }

  const absolutePath = resolve(dirname(file), target);

  try {
    const stats = statSync(absolutePath);
    const extension = extname(absolutePath).toLowerCase();

    if (!allowedExtensions.has(extension)) {
      recordError(file, `Unsupported image format (${extension}). Use webp or svg: ${target}`);
    }

    if (stats.size > maxSizeBytes) {
      recordError(
        file,
        `Image exceeds ${maxSizeBytes / 1024}KB (${Math.round(stats.size / 1024)}KB): ${target}`
      );
    }
  } catch {
    recordError(file, `Referenced image not found: ${target}`);
  }
};

for (const file of docs) {
  const source = readFileSync(file, "utf8");
  markdownImageRegex.lastIndex = 0;

  for (const match of source.matchAll(markdownImageRegex)) {
    const [, altText, target] = match;
    validateAsset(file, target, altText);
  }

  htmlImageRegex.lastIndex = 0;
  const htmlMatches: string[] = source.match(htmlImageRegex) ?? [];

  for (const tag of htmlMatches) {
    const src = tag.match(srcRegex)?.[1];

    if (!src) {
      recordError(file, "Image tag missing src attribute.");
      continue;
    }

    const alt = tag.match(altRegex)?.[1] ?? "";
    validateAsset(file, src, alt);
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log(`Image validation succeeded for ${docs.length} docs.`);


