---
name: git-push-raw
description: 'Commit files, push to GitHub, and print raw.githubusercontent.com links. Use when: committing and pushing assets; getting raw GitHub CDN links for images or files; hosting images from GitHub for use on other websites; getting direct image URLs after upload.'
argument-hint: '<file-or-dir> [<file-or-dir> ...] [-m "commit message"]'
---

# Git Commit, Push & Get Raw Links

## When to Use

- You have new or updated assets (images, WebP files, etc.) to push to GitHub
- You need a `raw.githubusercontent.com` URL to embed images on external websites
- You want to use GitHub as a free CDN for static assets

## How Raw Links Work

After pushing, files are accessible at:

```
https://raw.githubusercontent.com/<owner>/<repo>/<branch>/<path/to/file>
```

These links can be used directly in `<img src="...">`, CSS `background-image`, or any website.

## Requirements

- Node.js 18+
- Git configured with push access to GitHub (SSH key or HTTPS token)
- No extra npm dependencies needed

## Procedure

1. **Identify the files or directory** to commit.
2. **Run the push script**:

   ```bash
   # Single file
   node .github/skills/git-push-raw/scripts/push.js life-style/img.webp

   # Multiple files
   node .github/skills/git-push-raw/scripts/push.js life-style/img.webp hccs/banner.webp

   # Entire directory
   node .github/skills/git-push-raw/scripts/push.js life-style/

   # All changes in repo
   node .github/skills/git-push-raw/scripts/push.js .

   # Custom commit message
   node .github/skills/git-push-raw/scripts/push.js life-style/ -m "add lifestyle images"
   ```

3. **Copy the raw links** printed in the output. Example output:

   ```
   ✔ Committed: chore: update assets
   ✔ Pushed to origin/main

   Raw GitHub links:
     https://raw.githubusercontent.com/nguyenthinhit996/asset-public-storage/main/life-style/mind-map-speaking-step-1.webp
   ```

4. **Use the link** in your website:

   ```html
   <img src="https://raw.githubusercontent.com/nguyenthinhit996/asset-public-storage/main/life-style/mind-map-speaking-step-1.webp" />
   ```

## Options Reference

| Flag | Default | Description |
|------|---------|-------------|
| `-m`, `--message` | `"chore: update assets"` | Git commit message |

## Script

[scripts/push.js](./scripts/push.js)
