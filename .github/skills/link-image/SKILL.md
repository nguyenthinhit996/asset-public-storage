---
name: link-image
description: 'do link image — convert image to WebP, push to GitHub, get raw link. Use when: user says "do link image"; converting and hosting an image in one step; getting a raw.githubusercontent.com URL to use on other websites; upload image and get CDN link; parse image webp push git raw link.'
argument-hint: '<file-or-dir> [-q quality] [-m "commit message"]'
---

# Link Image (Convert → Push → Raw URL)

## When to Use

Trigger phrase: **"do link image"**

Use this skill any time the user wants to:
- Convert an image and get a link to use on another website
- Upload an asset to GitHub and get a raw CDN URL
- Do the full flow (WebP conversion + git push + raw link) in one step

## Requirements

- Node.js 18+
- Run once: `cd .github/skills/link-image && npm install`
- Git with push access to GitHub

## Procedure

1. **Install dependencies** (first time only):

   ```bash
   cd .github/skills/link-image && npm install && cd -
   ```

2. **Run the script** from the repo root:

   ```bash
   # Single image
   node .github/skills/link-image/scripts/link-image.js life-style/banner.png

   # Directory (all images inside)
   node .github/skills/link-image/scripts/link-image.js life-style/

   # Custom quality + commit message
   node .github/skills/link-image/scripts/link-image.js life-style/banner.png -q 90 -m "add banner"
   ```

3. **Copy the raw link** from output and use it anywhere:

   ```html
   <img src="https://raw.githubusercontent.com/nguyenthinhit996/asset-public-storage/main/life-style/banner.webp" />
   ```

## What the Script Does

| Step | Action |
|------|--------|
| 1 | Converts image(s) to WebP using `sharp` |
| 2 | Deletes the original file(s) |
| 3 | `git add` + `git commit` + `git push` |
| 4 | Prints `raw.githubusercontent.com` links |

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `-q`, `--quality` | `85` | WebP quality (1–100) |
| `-m`, `--message` | `"chore: add images"` | Git commit message |

## Script

[scripts/link-image.js](./scripts/link-image.js)
