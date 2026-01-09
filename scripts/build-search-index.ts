/**
 * Wiki Search Index Builder
 *
 * This script builds a search index from all Markdown/MDX files in the docs/ directory
 * and optionally syncs it to a Meilisearch instance.
 *
 * Usage:
 *   npm run build:search
 *
 * Environment Variables:
 *   MEILISEARCH_URL   - URL of the Meilisearch instance (optional, skips sync if not set)
 *   MEILISEARCH_KEY   - Admin API key for Meilisearch (optional, skips sync if not set)
 *   MEILISEARCH_INDEX - Index name (default: "wiki-docs")
 *
 * Output:
 *   build/search-index.json - JSON array of all indexed documents
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

import { glob } from "glob";
import matter from "gray-matter";
import { MeiliSearch } from "meilisearch";

/**
 * Shape of a document record for the search index.
 * The `id` field is derived from the slug with slashes replaced by double underscores
 * to comply with Meilisearch's ID constraints.
 */
type SearchRecord = {
  id: string;
  slug: string;
  title?: string;
  description?: string;
  tags: string[];
  lastUpdated?: string;
  status: string;
  lang: string;
  order: number;
  body: string;
};

/**
 * Extracts a string value from unknown frontmatter data.
 * @param value - The value to check
 * @returns The string if valid and non-empty, otherwise undefined
 */
const ensureString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value : undefined;

/**
 * Extracts a string array from unknown frontmatter data.
 * @param value - The value to check
 * @returns An array of strings, filtering out non-string items
 */
const ensureStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

/**
 * Extracts a number from unknown frontmatter data.
 * @param value - The value to check
 * @param fallback - Fallback value if not a valid finite number
 * @returns The number if valid, otherwise the fallback
 */
const ensureNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const repoRoot = resolve(process.cwd());

const files = await glob("docs/**/*.{md,mdx}", {
  ignore: ["**/_partials/**", "**/snippets/**"]
});

if (!files.length) {
  console.warn("No docs found. Skipping search index build.");
  process.exit(0);
}

const records: SearchRecord[] = files.map((filePath, index) => {
  const source = readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  const frontmatter = data as Record<string, unknown>;

  const slug = relative("docs", filePath)
    .replace(/\\/g, "/")
    .replace(/\.mdx?$/, "");

  // Meilisearch IDs can only contain alphanumeric chars, hyphens, and underscores
  const id = slug.replace(/\//g, "__");

  return {
    id,
    slug,
    title: ensureString(frontmatter.title),
    description: ensureString(frontmatter.description),
    tags: ensureStringArray(frontmatter.tags),
    lastUpdated: ensureString(frontmatter.lastUpdated),
    status: ensureString(frontmatter.status) ?? "stable",
    lang: ensureString(frontmatter.lang) ?? "en",
    order: ensureNumber(frontmatter.order, index),
    body: content
  };
});

const buildDir = resolve(repoRoot, "build");
mkdirSync(buildDir, { recursive: true });

const outputPath = resolve(buildDir, "search-index.json");
writeFileSync(outputPath, JSON.stringify(records, null, 2));
console.log(`Wrote ${records.length} records to ${outputPath}`);

const { MEILISEARCH_URL, MEILISEARCH_KEY, MEILISEARCH_INDEX } = process.env;
const indexUid = MEILISEARCH_INDEX ?? "wiki-docs";

if (!MEILISEARCH_URL || !MEILISEARCH_KEY) {
  console.log("MEILISEARCH_URL/KEY not set. Skipping remote sync.");
  process.exit(0);
}

try {
  const client = new MeiliSearch({
    host: MEILISEARCH_URL,
    apiKey: MEILISEARCH_KEY
  });

  const index = client.index(indexUid);

  // Configure index settings for optimal search relevance
  const settingsTask = await index.updateSettings({
    searchableAttributes: ["title", "description", "body"],
    displayedAttributes: ["id", "slug", "title", "description", "tags", "status", "lang", "order"],
    filterableAttributes: ["tags", "status", "lang"],
    sortableAttributes: ["order"],
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 }
    },
    pagination: { maxTotalHits: 1000 }
  });
  console.log(`Updated index settings (task ${settingsTask.taskUid})`);

  // Add documents to the index
  const task = await index.addDocuments(records, { primaryKey: "id" });
  console.log(`Triggered Meilisearch sync (task ${task.taskUid})`);
} catch (error: unknown) {
  console.error("Failed to sync with Meilisearch:");

  if (error instanceof Error) {
    console.error(error);
  } else {
    console.error(String(error));
  }

  process.exit(1);
}


