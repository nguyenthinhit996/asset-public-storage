#!/usr/bin/env node
/**
 * Convert images (PNG, JPG, JPEG, GIF, BMP, TIFF) to WebP format.
 *
 * Usage:
 *   node convert.js <input>                        # convert single file
 *   node convert.js <dir>                          # convert all images in directory
 *   node convert.js <input> -o <out>               # specify output path
 *   node convert.js <dir> --quality 90 --delete-original   # convert + remove originals
 *   node convert.js <dir> --remove                 # remove originals that already have a .webp
 */

import sharp from "sharp";
import { parseArgs } from "node:util";
import fs from "node:fs";
import path from "node:path";

const SUPPORTED_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".tif",
]);

function collectImages(inputPath) {
  const stat = fs.statSync(inputPath);
  if (stat.isFile()) {
    const ext = path.extname(inputPath).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      console.error(`Unsupported format: ${ext}`);
      process.exit(1);
    }
    return [inputPath];
  }

  const results = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        results.push(full);
      }
    }
  }
  walk(inputPath);
  return results.sort();
}

function resolveOutput(src, inputPath, outputArg, sources) {
  if (!outputArg) {
    return path.join(path.dirname(src), path.basename(src, path.extname(src)) + ".webp");
  }
  if (sources.length === 1 && path.extname(outputArg)) {
    return outputArg.replace(/\.[^.]+$/, ".webp");
  }
  const rel = path.relative(inputPath, src);
  return path.join(outputArg, rel.replace(/\.[^.]+$/, ".webp"));
}

async function convertImage(src, dest, quality) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(src).webp({ quality }).toFile(dest);
  console.log(`  ${src} -> ${dest}`);
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      output:            { type: "string",  short: "o", default: "" },
      quality:           { type: "string",  short: "q", default: "85" },
      "delete-original": { type: "boolean", default: false },
      remove:            { type: "boolean", default: false },
    },
  });

  if (!positionals.length) {
    console.error("Usage: node convert.js <input> [-o <output>] [-q <quality>] [--delete-original] [--remove]");
    process.exit(1);
  }

  const inputPath = positionals[0];
  const quality = Math.min(100, Math.max(1, parseInt(values.quality, 10)));
  const outputArg = values.output || "";

  if (!fs.existsSync(inputPath)) {
    console.error(`Path not found: ${inputPath}`);
    process.exit(1);
  }

  // --remove: delete originals that already have a matching .webp (no conversion)
  if (values.remove) {
    const sources = collectImages(inputPath);
    if (!sources.length) {
      console.error("No supported images found.");
      process.exit(1);
    }
    let removed = 0;
    for (const src of sources) {
      const webp = src.replace(/\.[^.]+$/, ".webp");
      if (fs.existsSync(webp)) {
        fs.unlinkSync(src);
        console.log(`  removed ${src} (${path.basename(webp)} exists)`);
        removed++;
      } else {
        console.log(`  skipped ${src} (no matching .webp found)`);
      }
    }
    console.log(`Done. Removed ${removed} original(s).`);
    return;
  }

  const sources = collectImages(inputPath);
  if (!sources.length) {
    console.error("No supported images found.");
    process.exit(1);
  }

  console.log(`Converting ${sources.length} image(s) to WebP (quality=${quality})...`);

  for (const src of sources) {
    const dest = resolveOutput(src, inputPath, outputArg, sources);
    await convertImage(src, dest, quality);
    if (values["delete-original"]) {
      fs.unlinkSync(src);
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
