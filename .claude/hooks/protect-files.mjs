#!/usr/bin/env node
/**
 * PreToolUse hook: block reads of secret files and edits of files Claude
 * must never change by hand. Exit 2 blocks the tool call and tells Claude why.
 *
 * Note: this covers the Read/Edit/Write/MultiEdit tools only, not Bash.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

/** @type {{ test: (rel: string) => boolean, blockRead?: boolean, why: string }[]} */
const RULES = [
  {
    // .env, .env.local, .env.production... but NOT .env.example
    test: (rel) => /(^|\/)\.env(\.[^/]+)?$/.test(rel) && !rel.endsWith(".env.example"),
    blockRead: true,
    why: "Environment files hold secrets. Use .env.example for variable names and ask the user to change real values.",
  },
  {
    test: (rel) => rel.startsWith("node_modules/") || rel.startsWith(".next/"),
    why: "Generated/vendor files. Never edit them; change the source or the dependency instead.",
  },
  {
    test: (rel) => rel === "pnpm-lock.yaml" || rel === "package-lock.json",
    why: "Lockfiles are managed by the package manager. Ask the user before changing dependencies.",
  },
];

let input;
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

const toolName = input?.tool_name;
const filePath = input?.tool_input?.file_path;
if (typeof filePath !== "string") process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? input.cwd ?? process.cwd();
const rel = path
  .relative(projectDir, path.resolve(projectDir, filePath))
  .split(path.sep)
  .join("/");
if (rel.startsWith("..")) process.exit(0);

const isRead = toolName === "Read";
for (const rule of RULES) {
  if (!rule.test(rel)) continue;
  if (isRead && !rule.blockRead) continue;
  process.stderr.write(`Blocked ${toolName} on ${rel}: ${rule.why}\n`);
  process.exit(2);
}

process.exit(0);
