#!/usr/bin/env node
/**
 * do link image — one command to:
 *   1. Convert image(s) to WebP
 *   2. Delete the original(s)
 *   3. Git commit + push
 *   4. Print raw.githubusercontent.com links
 *
 * Usage:
 *   node link-image.js <file-or-dir> [<file-or-dir> ...] [-q <quality>] [-m "message"]
 *
 * Examples:
 *   node link-image.js life-style/banner.png
 *   node link-image.js life-style/ -q 90 -m "add lifestyle images"
 */

import sharp from "sharp";
import { execSync } from "node:child_process";
import { parseArgs } from "node:util";
import fs from "node:fs";
import path from "node:path";

const SUPPORTED = new Set([".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".tif"]);

// ── utils ─────────────────────────────────────────────────────────────────────

function run(cmd, cwd) {
  return execSync(cmd, { cwd, encoding: "utf8" }).trim();
}

function parseRemote(url) {
  const m = url.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);
  if (!m) { console.error(`Cannot parse remote: ${url}`); process.exit(1); }
  return { owner: m[1], repo: m[2] };
}

function rawUrl(owner, repo, branch, rel) {
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${rel.split("/").map(encodeURIComponent).join("/")}`;
}

function collectImages(p) {
  const stat = fs.statSync(p);
  if (stat.isFile()) {
    if (!SUPPORTED.has(path.extname(p).toLowerCase())) {
      console.error(`Unsupported format: ${path.extname(p)}`); process.exit(1);
    }
    return [p];
  }
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (SUPPORTED.has(path.extname(e.name).toLowerCase())) out.push(full);
    }
  })(p);
  return out.sort();
}

// ── args ──────────────────────────────────────────────────────────────────────

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    quality: { type: "string", short: "q", default: "85" },
    message: { type: "string", short: "m", default: "chore: add images" },
  },
});

if (!positionals.length) {
  console.error("Usage: node link-image.js <file-or-dir> [...] [-q quality] [-m message]");
  process.exit(1);
}

const quality = Math.min(100, Math.max(1, parseInt(values.quality, 10)));
const repoRoot = run("git rev-parse --show-toplevel", process.cwd());

// ── step 1: collect source images ────────────────────────────────────────────

const sources = positionals.flatMap((p) => {
  const abs = path.resolve(process.cwd(), p);
  if (!fs.existsSync(abs)) { console.error(`Not found: ${abs}`); process.exit(1); }
  return collectImages(abs);
});

if (!sources.length) { console.error("No supported images found."); process.exit(1); }

console.log(`\n⟳  Converting ${sources.length} image(s) to WebP (quality=${quality})...`);

// ── step 2: convert + delete original ────────────────────────────────────────

const webpFiles = [];
for (const src of sources) {
  const dest = src.replace(/\.[^.]+$/, ".webp");
  await sharp(src).webp({ quality }).toFile(dest);
  fs.unlinkSync(src);
  webpFiles.push(dest);
  console.log(`  ✔ ${path.relative(repoRoot, src)} → ${path.basename(dest)}`);
}

// ── step 3: git add + commit + push ──────────────────────────────────────────

console.log("\n⟳  Committing and pushing...");

for (const f of webpFiles) run(`git add "${f}"`, repoRoot);
// stage deletions of originals (only if git still tracks them)
for (const f of sources) {
  try {
    const tracked = run(`git ls-files --error-unmatch "${f}" 2>/dev/null || echo ""`, repoRoot);
    if (tracked) run(`git rm --cached "${f}" 2>/dev/null || true`, repoRoot);
  } catch {}
}

const staged = run("git diff --cached --name-only", repoRoot);
if (!staged) { console.log("Nothing to commit."); process.exit(0); }

const msg = values.message.replace(/"/g, '\\"');
run(`git commit -m "${msg}"`, repoRoot);
run("git push origin HEAD", repoRoot);

const branch = run("git branch --show-current", repoRoot);
const { owner, repo } = parseRemote(run("git remote get-url origin", repoRoot));

// ── step 4: print raw links ───────────────────────────────────────────────────

console.log(`  ✔ Pushed to origin/${branch}\n`);
console.log("Raw GitHub links:");
for (const f of webpFiles) {
  const rel = path.relative(repoRoot, f).replace(/\\/g, "/");
  console.log(`  ${rawUrl(owner, repo, branch, rel)}`);
}
