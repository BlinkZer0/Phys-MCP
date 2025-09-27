#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const SAMPLE = resolve(ROOT, "docs", "examples", "mermaid-and-math.md");
const DIST = resolve(ROOT, "dist");

async function extractMermaid() {
  const raw = await readFile(SAMPLE, "utf8");
  const match = raw.match(/```mermaid[\r\n]+([\s\S]*?)```/);
  if (!match) {
    throw new Error("No mermaid block found in docs/examples/mermaid-and-math.md");
  }
  return match[1].trim();
}

async function findMmdc() {
  const ext = process.platform === "win32" ? ".cmd" : "";
  const cli = resolve(ROOT, "node_modules", ".bin", "mmdc" + ext);
  try {
    await access(cli, constants.X_OK);
    return cli;
  } catch (err) {
    return null;
  }
}

async function runMmdc(cliPath, inputFile, outputFile) {
  await mkdir(dirname(outputFile), { recursive: true });
  return new Promise((resolvePromise, rejectPromise) => {
    const proc = spawn(cliPath, ["-i", inputFile, "-o", outputFile, "-b", "transparent"], { stdio: "inherit" });
    proc.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`mmdc exited with code ${code}`));
    });
    proc.on("error", rejectPromise);
  });
}

async function main() {
  const cli = await findMmdc();
  if (!cli) {
    console.error("Mermaid CLI (mmdc) not found. Install @mermaid-js/mermaid-cli as a devDependency.");
    process.exitCode = 1;
    return;
  }
  const diagram = await extractMermaid();
  const tempFile = resolve(tmpdir(), "mermaid-smoke.mmd");
  const outputFile = resolve(DIST, "mermaid-smoke.svg");
  await writeFile(tempFile, diagram, "utf8");
  await runMmdc(cli, tempFile, outputFile);
  console.log(`[OK] Mermaid smoke SVG written to ${outputFile}`);
}

main().catch((err) => {
  console.error("docs-mermaid-smoke failed:", err);
  process.exitCode = 1;
});
