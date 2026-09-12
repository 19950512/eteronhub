#!/usr/bin/env node
"use strict";

// PreToolUse gate hook for the Bash tool.
// Reads the hook input JSON from stdin and denies/asks for destructive commands.
// See AGENTS.md for the non-negotiables this protects (e.g. no unreviewed
// history rewrites, no accidental prod-data-destroying commands).

const DENY_PATTERNS = [
  {
    re: /\brm\s+(-[a-z]*r[a-z]*f[a-z]*|-[a-z]*f[a-z]*r[a-z]*)\b/i,
    reason: "rm -rf (ou variante) apaga arquivos permanentemente",
  },
  {
    re: /\bgit\s+push\b[^\n]*--force(?!-with-lease)\b/i,
    reason: "git push --force pode sobrescrever histórico remoto",
  },
  {
    re: /\bgit\s+reset\s+--hard\b/i,
    reason: "git reset --hard descarta alterações locais não commitadas",
  },
  {
    re: /\bgit\s+clean\s+-[a-z]*f[a-z]*d?\b/i,
    reason: "git clean -f apaga arquivos não versionados permanentemente",
  },
  { re: /\bgit\s+branch\s+-D\b/i, reason: "git branch -D força a remoção de uma branch" },
  {
    re: /\bDROP\s+TABLE\b/i,
    reason: "DROP TABLE remove uma tabela e seus dados permanentemente",
  },
  {
    re: /\bDROP\s+DATABASE\b/i,
    reason: "DROP DATABASE remove um banco de dados inteiro",
  },
  {
    re: /\bprisma\s+migrate\s+reset\b/i,
    reason: "prisma migrate reset apaga o banco de dados e reaplica migrations do zero",
  },
];

const ASK_PATTERNS = [
  {
    re: /\bgit\s+push\b[^\n]*--force-with-lease\b/i,
    reason: "git push --force-with-lease reescreve histórico remoto",
  },
];

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

function emit(decision, reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: decision,
        permissionDecisionReason: reason,
      },
    }),
  );
}

async function main() {
  let input;
  try {
    input = JSON.parse((await readStdin()) || "{}");
  } catch {
    return; // malformed input: fail open, let the normal permission flow decide
  }

  const command = input?.tool_input?.command;
  if (typeof command !== "string" || command.length === 0) return;

  for (const { re, reason } of DENY_PATTERNS) {
    if (re.test(command)) {
      emit(
        "deny",
        `Comando bloqueado: ${reason}. Peça confirmação explícita ao usuário antes de rodar algo assim.`,
      );
      return;
    }
  }

  for (const { re, reason } of ASK_PATTERNS) {
    if (re.test(command)) {
      emit(
        "ask",
        `Comando arriscado: ${reason}. Confirme com o usuário antes de prosseguir.`,
      );
      return;
    }
  }
}

main();
