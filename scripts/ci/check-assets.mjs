#!/usr/bin/env node
import { stat, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fg from "fast-glob";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const MAX_FILE_SIZE = 512 * 1024; // 512 KiB

const assetPatterns = ["docs/assets/**/*.{png,jpg,jpeg,webp}"];
const docPatterns = ["docs/**/*.md", "docs/**/*.mdx"];

const assets = await fg(assetPatterns, { cwd: repoRoot, dot: false });
const violations = [];

for (const asset of assets) {
  const { size } = await stat(path.join(repoRoot, asset));
  if (size > MAX_FILE_SIZE) {
    violations.push({ type: "asset-size", file: asset, detail: `${size} bytes exceeds ${MAX_FILE_SIZE}` });
  }
}

const docs = await fg(docPatterns, { cwd: repoRoot, dot: false });
const imageRegex = /!\[(?<alt>[^\]]*)\]\((?<url>[^\s)]+)(?:\s+"[^"]*")?\)/g;

for (const doc of docs) {
  const content = await readFile(path.join(repoRoot, doc), "utf8");
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    const alt = match.groups?.alt ?? "";
    if (!alt.trim()) {
      violations.push({ type: "missing-alt", file: doc, detail: `Image missing alt text near offset ${match.index}` });
    }
  }
}

if (violations.length > 0) {
  console.error("Asset validation failed:\n");
  for (const violation of violations) {
    console.error(`- [${violation.type}] ${violation.file} :: ${violation.detail}`);
  }
  process.exit(1);
}

console.log(`Checked ${assets.length} assets and ${docs.length} docs.`);
