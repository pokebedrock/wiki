import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { Ajv } from "ajv";
import { glob } from "glob";
import matter from "gray-matter";

const schemaPath = resolve(process.cwd(), "schemas/frontmatter.schema.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf8")) as Record<string, unknown>;

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
const validate = ajv.compile<Record<string, unknown>>(schema);

const files = await glob("docs/**/*.{md,mdx}", {
  ignore: ["**/_partials/**", "**/snippets/**", "**/node_modules/**", "**/README.md"]
});

if (!files.length) {
  console.log("No markdown files found under docs/");
  process.exit(0);
}

let hasErrors = false;

const ensureString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value : null;

const detectLocaleFromPath = (filePath: string): string | null => {
  const normalizedPath = filePath.replace(/\\/g, "/");
  const match = normalizedPath.match(/^docs\/([a-z]{2})\//i);
  return match?.[1] ?? null;
};

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const { data } = matter(source);
  const frontmatter = data as Record<string, unknown>;
  const isValid = validate(frontmatter);
  const errors: string[] = [];

  if (!isValid) {
    for (const error of validate.errors ?? []) {
      const path = error.instancePath || "/";
      const message = error.message ?? "Unknown error";
      errors.push(`${path}: ${message}`);
    }
  }

  const expectedLocale = detectLocaleFromPath(file);
  const declaredLang = ensureString(frontmatter["lang"]);

  if (expectedLocale && declaredLang && declaredLang !== expectedLocale) {
    errors.push(`lang: expected \"${expectedLocale}\" based on file path, received \"${declaredLang}\"`);
  }

  if (!errors.length) {
    continue;
  }

  hasErrors = true;
  console.error(`\nFrontmatter errors in ${file}`);
  for (const message of errors) {
    console.error(`  • ${message}`);
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log(`Validated ${files.length} markdown files.`);


