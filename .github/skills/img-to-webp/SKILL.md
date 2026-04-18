---
name: img-to-webp
description: 'Convert images to WebP format. Use when: converting PNG, JPG, JPEG, GIF, BMP, or TIFF files to WebP; batch converting images in a directory; optimizing image assets for the web; parsing images to webp; reducing image file size while preserving quality.'
argument-hint: '<file-or-directory> [--quality 1-100] [--delete-original]'
---

# Image to WebP Conversion

## When to Use

- Convert a single image or a whole directory of images to WebP
- Optimize web assets for smaller file sizes
- Batch-process image folders before publishing

## Requirements

- Node.js 18+
- Install dependencies: `npm install` (uses [sharp](https://sharp.pixelplumbing.com/))

## Procedure

1. **Identify the target** — get the file path or directory from the user.
2. **Install dependencies** (first time only):

   ```bash
   cd .github/skills/img-to-webp && npm install
   ```

3. **Run the conversion script**:

   ```bash
   # Single file
   node .github/skills/img-to-webp/scripts/convert.js path/to/image.png

   # Directory (recursive)
   node .github/skills/img-to-webp/scripts/convert.js path/to/images/

   # Custom quality (1-100, default 85)
   node .github/skills/img-to-webp/scripts/convert.js path/to/images/ --quality 90

   # Custom output location
   node .github/skills/img-to-webp/scripts/convert.js src/images/ -o dist/images/

   # Convert and delete originals in one step
   node .github/skills/img-to-webp/scripts/convert.js path/to/images/ --delete-original

   # Remove originals that already have a matching .webp (no re-conversion)
   node .github/skills/img-to-webp/scripts/convert.js path/to/images/ --remove
   ```

4. **Verify output** — confirm `.webp` files were created alongside (or at) the specified output path.

## Supported Formats

| Input | Notes |
|-------|-------|
| `.png` | Transparency preserved via RGBA |
| `.jpg` / `.jpeg` | Lossy; quality flag applies |
| `.gif` | First frame only |
| `.bmp` | Converted to RGB |
| `.tiff` / `.tif` | Full support |

## Options Reference

| Flag | Default | Description |
|------|---------|-------------|
| `-o`, `--output` | next to source | Output file or directory |
| `-q`, `--quality` | `85` | WebP quality (1 = smallest, 100 = lossless-like) |
| `--delete-original` | off | Remove source files immediately after conversion |
| `--remove` | off | Remove source files that already have a matching `.webp` (skips conversion) |

## Script

[scripts/convert.js](./scripts/convert.js)
