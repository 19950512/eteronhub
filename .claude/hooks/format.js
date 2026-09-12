#!/usr/bin/env node
"use strict";

// PostToolUse feedback hook for Write/Edit.
// Reads the hook input JSON from stdin and runs `eslint --fix` on the
// touched file when it's TypeScript/JavaScript, so lint issues are caught
// immediately instead of at CI time.

const { spawnSync } = require("child_process");
const path = require("path");
const Module = require("module");

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

async function main() {
  let input;
  try {
    input = JSON.parse((await readStdin()) || "{}");
  } catch {
    return;
  }

  const filePath = input?.tool_response?.filePath || input?.tool_input?.file_path;
  if (typeof filePath !== "string" || filePath.length === 0) return;
  if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(filePath)) return;
  if (/node_modules[\\/]/.test(filePath)) return;

  const repoRoot = path.resolve(__dirname, "..", "..");

  let eslintBin;
  try {
    const require = Module.createRequire(path.join(repoRoot, "package.json"));
    const pkgPath = require.resolve("eslint/package.json");
    const pkg = require(pkgPath);
    eslintBin = path.join(path.dirname(pkgPath), pkg.bin.eslint);
  } catch {
    return; // eslint not installed at repo root: nothing to run
  }

  const result = spawnSync(process.execPath, [eslintBin, "--fix", filePath], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  if (result.error || (result.status !== 0 && result.status !== null)) {
    const detail =
      result.stderr || result.stdout || result.error?.message || "erro desconhecido";
    process.stdout.write(
      JSON.stringify({
        systemMessage: `eslint --fix falhou em ${filePath}: ${detail.slice(0, 500)}`,
      }),
    );
  }
}

main();
