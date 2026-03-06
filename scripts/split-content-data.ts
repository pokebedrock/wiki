import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type JsonObject = Record<string, unknown>;

const repoRoot = resolve(process.cwd());
const contentRoot = resolve(repoRoot, "assets", "content");
const pokemonMonolithPath = resolve(contentRoot, "wikiPokemon.json");
const movesMonolithPath = resolve(contentRoot, "wikiMoves.json");
const pokemonDirectory = resolve(contentRoot, "pokemon");
const movesDirectory = resolve(contentRoot, "moves");

const readJsonObject = (filePath: string): JsonObject => {
  const source = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  if (typeof source !== "object" || source === null || Array.isArray(source)) {
    throw new Error(`Expected ${filePath} to contain a JSON object.`);
  }

  return source as JsonObject;
};

const ensureObject = (value: unknown): JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value) ? (value as JsonObject) : {};

const writeEntryFiles = (entries: [string, unknown][], targetDirectory: string) => {
  rmSync(targetDirectory, { recursive: true, force: true });
  mkdirSync(targetDirectory, { recursive: true });

  entries.forEach(([id, value], index) => {
    const entry = ensureObject(value);
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

const pokemonEntries = Object.entries(readJsonObject(pokemonMonolithPath));
const moveEntries = Object.entries(readJsonObject(movesMonolithPath));

writeEntryFiles(pokemonEntries, pokemonDirectory);
writeEntryFiles(moveEntries, movesDirectory);

console.log(`Wrote ${pokemonEntries.length} Pokemon files to ${pokemonDirectory}`);
console.log(`Wrote ${moveEntries.length} move files to ${movesDirectory}`);
