#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import fg from "fast-glob";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const bin = path.join(repoRoot, "node_modules", ".bin", "markdown-link-check");
const configPath = path.join(repoRoot, "mlc_config.json");

try {
  await readFile(bin);
} catch (error) {
  console.error("markdown-link-check binary not found. Did you run npm install?");
  process.exit(1);
}

const execFileAsync = promisify(execFile);

const files = await fg(["docs/**/*.md", "docs/**/*.mdx", "README.md", "CONTRIBUTING.md"], {
  cwd: repoRoot,
  ignore: ["**/node_modules/**"],
  dot: false
});

const failures = [];

for (const file of files) {
  try {
    await execFileAsync(bin, ["-q", "-c", configPath, file], { cwd: repoRoot, stdio: "inherit" });
  } catch (error) {
    failures.push(file);
  }
}

if (failures.length > 0) {
  console.error("Link checking failed for the following files:\n");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Checked links in ${files.length} files.`);
