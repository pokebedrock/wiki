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

type SearchIndicesPayload = {
  docs: SearchRecord[];
  pokemon: SearchRecord[];
  moves: SearchRecord[];
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

const readOptionalJsonDirectory = async (
  relativeDirectory: string,
): Promise<Array<{ id: string; value: unknown }> | null> => {
  const filePaths = await glob(`${relativeDirectory}/*.json`);

  if (filePaths.length === 0) {
    return null;
  }

  return filePaths
    .sort((left, right) => left.localeCompare(right))
    .map((filePath) => {
      const id = filePath.split("/").pop()?.replace(/\.json$/i, "");
      if (!id) {
        return null;
      }

      const absolutePath = resolve(repoRoot, filePath);
      const source = readFileSync(absolutePath, "utf8");
      return {
        id,
        value: JSON.parse(source) as unknown,
      };
    })
    .filter((entry): entry is { id: string; value: unknown } => entry !== null);
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
const wikiIndexUids = {
  docs: "wiki-docs",
  pokemon: "wiki-pokemon",
  moves: "wiki-moves",
} as const;

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

const pokemonEntries = (await readOptionalJsonDirectory("assets/content/pokemon")) ?? [];

const pokemonOrderBase = docRecords.length + 1;
const pokemonRecords: SearchRecord[] = pokemonEntries.map(({ id, value: pokemon }, index) => {
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
      order: pokemonOrderBase + ensureNumber(pokemonData["sortOrder"], index + 1),
      body: buildPokemonBody(id, pokemonData)
    } satisfies SearchRecord;
  });

const moveEntries = (await readOptionalJsonDirectory("assets/content/moves")) ?? [];

const moveOrderBase = pokemonOrderBase + pokemonRecords.length + 1;
const moveRecords: SearchRecord[] = moveEntries.map(({ id, value: move }, index) => {
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
      order: moveOrderBase + ensureNumber(moveData["sortOrder"], index + 1),
      body: buildMoveBody(id, moveData)
    } satisfies SearchRecord;
  });

const indicesPayload: SearchIndicesPayload = {
  docs: docRecords,
  pokemon: pokemonRecords,
  moves: moveRecords,
};
const records: SearchRecord[] = [
  ...indicesPayload.docs,
  ...indicesPayload.pokemon,
  ...indicesPayload.moves,
];

const buildDir = resolve(repoRoot, "build");
mkdirSync(buildDir, { recursive: true });

const outputPath = resolve(buildDir, "search-index.json");
writeFileSync(outputPath, JSON.stringify(records, null, 2));
console.log(`Wrote ${records.length} records to ${outputPath}`);

const indicesOutputPath = resolve(buildDir, "search-indices.json");
writeFileSync(indicesOutputPath, JSON.stringify(indicesPayload, null, 2));
console.log(
  `Wrote docs=${indicesPayload.docs.length}, pokemon=${indicesPayload.pokemon.length}, moves=${indicesPayload.moves.length} to ${indicesOutputPath}`,
);

const indexSettings = {
  searchableAttributes: ["title", "description", "tags", "slug", "body"],
  filterableAttributes: ["lang", "status", "tags"],
  sortableAttributes: ["order", "lastUpdated"],
  displayedAttributes: ["id", "slug", "title", "description", "tags", "status", "lang", "order"],
};

const isIndexAlreadyExistsError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: unknown }).code === "index_already_exists";

const syncIndex = async (client: MeiliSearch, indexUid: string, indexRecords: SearchRecord[]) => {
  const index = client.index(indexUid);

  try {
    const createIndexTask = await client.createIndex(indexUid, { primaryKey: "id" });
    await client.waitForTask(createIndexTask.taskUid);
  } catch (error: unknown) {
    if (!isIndexAlreadyExistsError(error)) {
      throw error;
    }
  }

  const settingsTask = await index.updateSettings(indexSettings);
  await client.waitForTask(settingsTask.taskUid);

  const clearTask = await index.deleteAllDocuments();
  await client.waitForTask(clearTask.taskUid);

  if (indexRecords.length === 0) {
    console.log(`Cleared Meilisearch index ${indexUid} (task ${clearTask.taskUid})`);
    return;
  }

  const task = await index.addDocuments(indexRecords, { primaryKey: "id" });
  await client.waitForTask(task.taskUid);
  console.log(`Synced ${indexRecords.length} records to ${indexUid} (task ${task.taskUid})`);
};

const { MEILISEARCH_URL, MEILISEARCH_KEY } = process.env;

if (!MEILISEARCH_URL || !MEILISEARCH_KEY) {
  console.log("MEILISEARCH_URL/KEY not set. Skipping remote sync.");
  process.exit(0);
}

try {
  const client = new MeiliSearch({
    host: MEILISEARCH_URL,
    apiKey: MEILISEARCH_KEY
  });

  await syncIndex(client, wikiIndexUids.docs, indicesPayload.docs);
  await syncIndex(client, wikiIndexUids.pokemon, indicesPayload.pokemon);
  await syncIndex(client, wikiIndexUids.moves, indicesPayload.moves);
} catch (error: unknown) {
  console.error("Failed to sync with Meilisearch:");

  if (error instanceof Error) {
    console.error(error);
  } else {
    console.error(String(error));
  }

  process.exit(1);
}
