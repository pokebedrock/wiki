import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

import { glob } from "glob";
import matter from "gray-matter";
import { MeiliSearch } from "meilisearch";

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

const ensureString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value : undefined;

const ensureStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

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

  return {
    id: slug,
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


