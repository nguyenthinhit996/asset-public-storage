#!/usr/bin/env node
/**
 * Commit, push to GitHub, and print raw.githubusercontent.com links.
 *
 * Usage:
 *   node push.js <file-or-dir> [<file-or-dir> ...] [-m "commit message"]
 *   node push.js .                          # stage all changes
 *   node push.js life-style/img.webp -m "add image"
 */

import { execSync } from "node:child_process";
import { parseArgs } from "node:util";
import fs from "node:fs";
import path from "node:path";

// ── helpers ──────────────────────────────────────────────────────────────────

function run(cmd, cwd) {
  return execSync(cmd, { cwd, encoding: "utf8" }).trim();
}

/** Parse git remote URL → { owner, repo } */
function parseRemote(remoteUrl) {
  // SSH: git@github.com:owner/repo.git
  // HTTPS: https://github.com/owner/repo.git
  const match =
    remoteUrl.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/) ;
  if (!match) {
    console.error(`Cannot parse GitHub remote URL: ${remoteUrl}`);
    process.exit(1);
  }
  return { owner: match[1], repo: match[2] };
}

/** Collect all committed file paths that were staged (relative to repo root) */
function stagedRelativePaths(repoRoot, targets) {
  const raw = run(`git diff --cached --name-only`, repoRoot);
  return raw ? raw.split("\n").filter(Boolean) : [];
}

/** Build raw.githubusercontent.com URL */
function rawUrl(owner, repo, branch, relPath) {
  const encoded = relPath.split("/").map(encodeURIComponent).join("/");
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encoded}`;
}

// ── main ─────────────────────────────────────────────────────────────────────

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    message: { type: "string", short: "m", default: "chore: update assets" },
  },
});

if (!positionals.length) {
  console.error(
    "Usage: node push.js <file-or-dir> [<file-or-dir> ...] [-m \"message\"]"
  );
  process.exit(1);
}

// Resolve repo root (where .git lives)
const repoRoot = run("git rev-parse --show-toplevel", process.cwd());

// Resolve targets to absolute paths, then make relative to repo root
const targets = positionals.map((t) => {
  const abs = path.resolve(process.cwd(), t);
  if (!fs.existsSync(abs)) {
    console.error(`Path not found: ${abs}`);
    process.exit(1);
  }
  return abs;
});

// Stage files
for (const target of targets) {
  run(`git add "${target}"`, repoRoot);
}

// Check if anything is actually staged
const staged = stagedRelativePaths(repoRoot, targets);
if (!staged.length) {
  console.log("Nothing to commit — working tree clean.");
  process.exit(0);
}

// Commit
run(`git commit -m "${values.message.replace(/"/g, '\\"')}"`, repoRoot);
console.log(`✔ Committed: ${values.message}`);

// Get branch & remote info before push
const branch = run("git branch --show-current", repoRoot);
const remoteUrl = run("git remote get-url origin", repoRoot);
const { owner, repo } = parseRemote(remoteUrl);

// Push
run("git push origin HEAD", repoRoot);
console.log(`✔ Pushed to origin/${branch}\n`);

// Print raw links
console.log("Raw GitHub links:");
for (const rel of staged) {
  console.log(`  ${rawUrl(owner, repo, branch, rel)}`);
}
