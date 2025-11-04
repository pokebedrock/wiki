#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const schemaPath = path.join(repoRoot, "schemas", "frontmatter.schema.json");

const schema = JSON.parse(await readFile(schemaPath, "utf8"));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validate = ajv.compile(schema);

const patterns = ["docs/**/*.md", "docs/**/*.mdx"];
const files = await fg(patterns, {
  cwd: repoRoot,
  ignore: ["**/node_modules/**", "**/README.md"],
  dot: false
});

const failures = [];

for (const relativePath of files) {
  if (relativePath.startsWith("docs/snippets/") || relativePath.startsWith("docs/_partials/")) {
    continue;
  }
  const fullPath = path.join(repoRoot, relativePath);
  const raw = await readFile(fullPath, "utf8");
  const parsed = matter(raw);

  const ok = validate(parsed.data);
  if (!ok) {
    failures.push({ file: relativePath, errors: validate.errors ?? [] });
  }
}

if (failures.length > 0) {
  console.error("Frontmatter validation failed:\n");
  for (const failure of failures) {
    console.error(`- ${failure.file}`);
    for (const err of failure.errors) {
      console.error(`  • ${err.instancePath || "/"} ${err.message}`);
    }
  }
  process.exit(1);
}

console.log(`Validated ${files.length} files against frontmatter schema.`);
