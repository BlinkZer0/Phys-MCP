#!/usr/bin/env node
import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const TARGET_DIR = resolve(ROOT, "assets", "svg");
const CONFIG_FILE = resolve(ROOT, "svgo.config.json");

async function loadConfig() {
  const raw = await readFile(CONFIG_FILE, "utf8");
  return JSON.parse(raw);
}

async function getSvgFiles() {
  const entries = await readdir(TARGET_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === ".svg")
    .map((entry) => resolve(TARGET_DIR, entry.name))
    .sort();
}

async function main() {
  let optimize;
  try {
    ({ optimize } = await import("svgo"));
  } catch (error) {
    console.error("svgo not found. Run `npm install` to install devDependencies before running this script.");
    process.exitCode = 1;
    return;
  }

  const config = await loadConfig();
  const files = await getSvgFiles();

  if (!files.length) {
    console.log("No SVG files found under", TARGET_DIR);
    return;
  }

  let failures = 0;
  for (const file of files) {
    const before = await readFile(file, "utf8");
    const result = optimize(before, { path: file, ...config });
    if ("error" in result) {
      failures++;
      console.error(`[ERR] SVGO failed for ${file}: ${result.error}`);
      continue;
    }

    const optimized = result.data;
    const beforeBytes = Buffer.byteLength(before, "utf8");
    const afterBytes = Buffer.byteLength(optimized, "utf8");

    if (afterBytes > beforeBytes) {
      failures++;
      console.error(`[ERR] ${file} grew from ${beforeBytes} to ${afterBytes} bytes. Investigate animations/filters.`);
      continue;
    }

    if (optimized !== before) {
      await writeFile(file, optimized, "utf8");
      console.log(`[OK] Optimized ${file} (${beforeBytes} -> ${afterBytes} bytes)`);
    } else {
      console.log(`[SKIP] ${file} already optimal (${beforeBytes} bytes)`);
    }
  }

  if (failures) {
    console.error(`SVGO completed with ${failures} issue(s).`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("SVGO script failed:", err);
  process.exitCode = 1;
});
