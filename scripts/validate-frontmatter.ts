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

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const { data } = matter(source);
  const frontmatter = data as Record<string, unknown>;
  const isValid = validate(frontmatter);

  if (isValid) {
    continue;
  }

  hasErrors = true;
  console.error(`\nFrontmatter errors in ${file}`);

  for (const error of validate.errors ?? []) {
    const path = error.instancePath || "/";
    const message = error.message ?? "Unknown error";
    console.error(`  • ${path}: ${message}`);
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log(`Validated ${files.length} markdown files.`);


