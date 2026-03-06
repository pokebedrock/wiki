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

type JsonRecord = Record<string, unknown>;

const ensureString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value : undefined;

const ensureStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const ensureNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const ensureObject = (value: unknown): JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value) ? (value as JsonRecord) : {};

const sanitizeTag = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeTags = (values: string[]): string[] =>
  Array.from(new Set(values.map((value) => sanitizeTag(value)).filter((value) => value.length > 0)));

const formatLabel = (value: string): string =>
  value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const readOptionalJson = <T>(relativePath: string): T | null => {
  const absolutePath = resolve(repoRoot, relativePath);

  try {
    const source = readFileSync(absolutePath, "utf8");
    return JSON.parse(source) as T;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.warn(`Skipping optional data source ${relativePath}: ${error.message}`);
    } else {
      console.warn(`Skipping optional data source ${relativePath}`);
    }

    return null;
  }
};

const buildPokemonBody = (id: string, pokemonRaw: unknown): string => {
  const pokemon = ensureObject(pokemonRaw);
  const description = ensureString(pokemon["description"]);
  const types = ensureStringArray(pokemon["types"]);
  const abilityValues = Object.values(ensureObject(pokemon["abilities"])).filter(
    (value): value is string => typeof value === "string",
  );
  const moveValues = (Array.isArray(pokemon["moves"]) ? pokemon["moves"] : [])
    .map((entry) => ensureString(ensureObject(entry)["move"]))
    .filter((value): value is string => value !== undefined)
    .slice(0, 140);
  const levelRange = Array.isArray(pokemon["level_range"])
    ? pokemon["level_range"].filter((value): value is number => typeof value === "number")
    : [];

  const stats = ensureObject(pokemon["stats"]);
  const statBody = ["hp", "atk", "def", "spa", "spd", "spe"]
    .map((key) => {
      const value = stats[key];
      return typeof value === "number" ? `${key.toUpperCase()}:${value}` : null;
    })
    .filter((value): value is string => value !== null)
    .join(", ");

  return [
    formatLabel(id),
    description,
    types.length ? `Types: ${types.join(", ")}` : null,
    abilityValues.length ? `Abilities: ${abilityValues.join(", ")}` : null,
    levelRange.length ? `Wild level range: ${levelRange.join("-")}` : null,
    statBody.length ? `Base stats: ${statBody}` : null,
    moveValues.length ? `Learnable moves: ${moveValues.join(", ")}` : null,
  ]
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .join("\n");
};

const buildMoveBody = (id: string, moveRaw: unknown): string => {
  const move = ensureObject(moveRaw);
  const description = ensureString(move["description"]);
  const type = ensureString(move["type"]);
  const category = ensureString(move["category"]);
  const accuracy = move["accuracy"];
  const pp = move["pp"];
  const priority = move["priority"];
  const target = ensureString(move["target"]);
  const flags = ensureStringArray(move["flags"]);
  const contestType = ensureString(move["contestType"]);

  const moveStats = [
    typeof accuracy === "number" || typeof accuracy === "boolean" ? `Accuracy: ${accuracy}` : null,
    typeof pp === "number" ? `PP: ${pp}` : null,
    typeof priority === "number" ? `Priority: ${priority}` : null,
    target ? `Target: ${target}` : null,
    contestType ? `Contest: ${contestType}` : null,
  ]
    .filter((value): value is string => value !== null)
    .join(" | ");

  return [
    formatLabel(id),
    description,
    type ? `Type: ${type}` : null,
    category ? `Category: ${category}` : null,
    moveStats.length ? moveStats : null,
    flags.length ? `Flags: ${flags.join(", ")}` : null,
  ]
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .join("\n");
};

const repoRoot = resolve(process.cwd());

const files = await glob("docs/**/*.{md,mdx}", {
  ignore: ["**/_partials/**", "**/snippets/**"]
});

if (!files.length) {
  console.warn("No docs found. Skipping search index build.");
  process.exit(0);
}

const docRecords: SearchRecord[] = files.map((filePath, index) => {
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

const records: SearchRecord[] = [...docRecords];
let orderOffset = docRecords.length;

const pokemonIndex = readOptionalJson<Record<string, unknown>>("assets/content/wikiPokemon.json");
if (pokemonIndex) {
  const pokemonRecords = Object.entries(pokemonIndex).map(([id, pokemon], index) => {
    const pokemonData = ensureObject(pokemon);
    const types = ensureStringArray(pokemonData["types"]);
    const tags = ensureStringArray(pokemonData["tags"]);

    return {
      id: `content/pokemon/${id}`,
      slug: `content/pokemon/${id}`,
      title: ensureString(pokemonData["name"]) ?? formatLabel(id),
      description: ensureString(pokemonData["description"]),
      tags: normalizeTags(["content", "pokemon", ...types, ...tags]),
      status: "stable",
      lang: "en",
      order: orderOffset + index,
      body: buildPokemonBody(id, pokemonData)
    } satisfies SearchRecord;
  });

  records.push(...pokemonRecords);
  orderOffset += pokemonRecords.length;
}

const moveIndex = readOptionalJson<Record<string, unknown>>("assets/content/wikiMoves.json");
if (moveIndex) {
  const moveRecords = Object.entries(moveIndex).map(([id, move], index) => {
    const moveData = ensureObject(move);
    const type = ensureString(moveData["type"]);
    const category = ensureString(moveData["category"]);

    return {
      id: `content/moves/${id}`,
      slug: `content/moves/${id}`,
      title: ensureString(moveData["name"]) ?? formatLabel(id),
      description: ensureString(moveData["description"]),
      tags: normalizeTags(["content", "moves", type ?? "", category ?? ""]),
      status: "stable",
      lang: "en",
      order: orderOffset + index,
      body: buildMoveBody(id, moveData)
    } satisfies SearchRecord;
  });

  records.push(...moveRecords);
}

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
