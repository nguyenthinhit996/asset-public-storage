---
name: link
description: "Convert image to WebP, push to GitHub, get raw link. Usage: /link <path>"
argument-hint: "<image-file-or-directory>"
agent: agent
---

Run the link-image skill on the path provided in the argument.

Steps to follow:
1. Read [SKILL.md](./../skills/link-image/SKILL.md) for full procedure.
2. Install dependencies if `node_modules` is missing inside `.github/skills/link-image/`:
   ```bash
   cd .github/skills/link-image && npm install && cd -
   ```
3. Run the script from the repo root using the path the user provided as the argument:
   ```bash
   node .github/skills/link-image/scripts/link-image.js <argument>
   ```
4. Show the user the raw GitHub link(s) printed by the script.
