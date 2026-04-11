import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

type JsonObject = Record<string, unknown>;

const repoRoot = resolve(process.cwd());
const contentRoot = resolve(repoRoot, "assets", "content");
const pokemonMonolithPath = resolve(contentRoot, "wikiPokemon.json");
const movesMonolithPath = resolve(contentRoot, "wikiMoves.json");
const pokemonFallbackDirectory = resolve(contentRoot, "en", "pokemon");
const movesFallbackDirectory = resolve(contentRoot, "en", "moves");
const getPokemonDirectory = (locale: "en" | "es") => resolve(contentRoot, locale, "pokemon");
const getMovesDirectory = (locale: "en" | "es") => resolve(contentRoot, locale, "moves");

const readJsonObject = (filePath: string): JsonObject => {
  const source = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  if (typeof source !== "object" || source === null || Array.isArray(source)) {
    throw new Error(`Expected ${filePath} to contain a JSON object.`);
  }

  return source as JsonObject;
};

const ensureObject = (value: unknown): JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value) ? (value as JsonObject) : {};

const writeEntryFiles = (entries: [string, JsonObject][], targetDirectory: string) => {
  rmSync(targetDirectory, { recursive: true, force: true });
  mkdirSync(targetDirectory, { recursive: true });

  entries.forEach(([id, entry], index) => {
    const outputPath = resolve(targetDirectory, `${id}.json`);
    const normalizedEntry = {
      ...entry,
      sortOrder:
        typeof entry["sortOrder"] === "number" && Number.isFinite(entry["sortOrder"])
          ? entry["sortOrder"]
          : index + 1,
    };

    writeFileSync(outputPath, `${JSON.stringify(normalizedEntry, null, 2)}\n`);
  });
};

const readJsonFile = (filePath: string): JsonObject => {
  const parsed = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  return ensureObject(parsed);
};

const readDirectoryEntries = (directoryPath: string): [string, JsonObject][] => {
  const files = readdirSync(directoryPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  return files.map((fileName) => {
    const id = fileName.replace(/\.json$/u, "");
    const filePath = resolve(directoryPath, fileName);
    return [id, readJsonFile(filePath)];
  });
};

const loadEntries = (
  monolithPath: string,
  fallbackDirectory: string,
  datasetLabel: string
): [string, JsonObject][] => {
  if (existsSync(monolithPath)) {
    console.log(`Using ${datasetLabel} monolith ${relative(repoRoot, monolithPath)}`);
    return Object.entries(readJsonObject(monolithPath)).map(([id, value]) => [id, ensureObject(value)]);
  }

  if (!existsSync(fallbackDirectory)) {
    throw new Error(
      `Missing ${datasetLabel} inputs. Expected either ${relative(
        repoRoot,
        monolithPath
      )} or ${relative(repoRoot, fallbackDirectory)}.`
    );
  }

  console.log(
    `Monolith not found for ${datasetLabel}; cloning entries from ${relative(
      repoRoot,
      fallbackDirectory
    )}`
  );
  return readDirectoryEntries(fallbackDirectory);
};

const pokemonEntries = loadEntries(pokemonMonolithPath, pokemonFallbackDirectory, "Pokemon");
const moveEntries = loadEntries(movesMonolithPath, movesFallbackDirectory, "Moves");

const locales: Array<"en" | "es"> = ["en", "es"];
for (const locale of locales) {
  writeEntryFiles(pokemonEntries, getPokemonDirectory(locale));
  writeEntryFiles(moveEntries, getMovesDirectory(locale));
}

for (const locale of locales) {
  console.log(`Wrote ${pokemonEntries.length} Pokemon files to ${getPokemonDirectory(locale)}`);
  console.log(`Wrote ${moveEntries.length} move files to ${getMovesDirectory(locale)}`);
}
