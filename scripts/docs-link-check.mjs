#!/usr/bin/env node
import { readdir, stat, readFile } from "node:fs/promises";
import { resolve, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const DOCS = resolve(ROOT, "docs");
const MARKDOWN_EXT = new Set([".md", ".mdx"]);
const LINK_RE = /\[[^\]]*\]\(([^)]+)\)/g;

async function collectMarkdown(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdown(resolve(dir, entry.name))));
    } else if (MARKDOWN_EXT.has(extname(entry.name).toLowerCase())) {
      files.push(resolve(dir, entry.name));
    }
  }
  return files;
}

async function checkLinks(file) {
  const broken = [];
  const raw = await readFile(file, "utf8");
  const dir = dirname(file);
  const matches = raw.matchAll(LINK_RE);
  for (const match of matches) {
    const target = match[1].split("#")[0];
    if (!target || target.startsWith("http") || target.startsWith("mailto:")) {
      continue;
    }
    if (target.startsWith("{#")) {
      continue; // Docusaurus/MkDocs id reference.
    }
    const resolved = resolve(dir, target);
    try {
      await stat(resolved);
    } catch (err) {
      broken.push({ target, resolved });
    }
  }
  return broken;
}

async function main() {
  const files = await collectMarkdown(DOCS);
  let totalBroken = 0;
  for (const file of files) {
    const broken = await checkLinks(file);
    if (broken.length) {
      console.error(`[ERR] ${file}`);
      for (const issue of broken) {
        console.error(`  -> Missing: ${issue.target} (resolved ${issue.resolved})`);
      }
      totalBroken += broken.length;
    }
  }

  if (!totalBroken) {
    console.log(`[OK] All internal doc links resolved across ${files.length} file(s).`);
  } else {
    console.error(`Found ${totalBroken} broken link(s).`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("docs-link-check failed:", err);
  process.exitCode = 1;
});
