#!/usr/bin/env node
/**
 * Generates responsive image variants for public/images/{pois,tours,guides}.
 *
 * Canonical format: /images/<type>/<name>.webp  (leading slash, .webp)
 * Variant convention: <name>_400.webp, <name>_800.webp, <name>_1600.webp
 * placed next to the original. Variants are never upscaled beyond the
 * original width (withoutEnlargement), but the file always exists.
 *
 * For originals that exist only as .jpg, a full-size .webp twin is created
 * first (quality 82) so the canonical .webp path is always resolvable.
 * Originals are never deleted. The pois/originals/ backup dir is skipped.
 *
 * Run: node scripts/generate-image-variants.mjs
 */
import sharp from 'sharp';
import { readdirSync, existsSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'public', 'images');
const DIRS = ['pois', 'tours', 'guides'];
const WIDTHS = [400, 800, 1600];
const VARIANT_RE = /_(400|800|1600)\.webp$/;

let madeWebp = 0;
let madeVariants = 0;
let skipped = 0;

for (const dir of DIRS) {
  const abs = join(root, dir);
  if (!existsSync(abs)) continue;
  const entries = readdirSync(abs).filter((f) => statSync(join(abs, f)).isFile());
  const files = entries.filter((f) => !VARIANT_RE.test(f) && /\.(jpe?g|webp|png)$/i.test(f));
  const bases = new Map(); // base name -> source file (prefer .webp)
  for (const f of files) {
    const base = basename(f, extname(f));
    const prev = bases.get(base);
    if (!prev || extname(f).toLowerCase() === '.webp') bases.set(base, f);
  }

  for (const [base, src] of bases) {
    const srcPath = join(abs, src);
    // 1) ensure canonical full-size .webp exists
    const canonical = join(abs, `${base}.webp`);
    if (!existsSync(canonical)) {
      await sharp(srcPath).webp({ quality: 82 }).toFile(canonical);
      madeWebp++;
    }
    // 2) variants from the canonical webp
    for (const w of WIDTHS) {
      const out = join(abs, `${base}_${w}.webp`);
      if (existsSync(out)) { skipped++; continue; }
      await sharp(canonical)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(out);
      madeVariants++;
    }
  }
  console.log(`${dir}: ${bases.size} base images processed`);
}
console.log(`full-size webp created: ${madeWebp}, variants created: ${madeVariants}, skipped existing: ${skipped}`);
