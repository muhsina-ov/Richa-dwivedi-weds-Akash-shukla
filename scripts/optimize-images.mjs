import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'assets', 'gallery');

// Slot order: 1 Hero, 2 Bride, 3 Groom, 4 Couple-side, 5 Family-side, 6 Family/Couple, 7 Memories
const sources = [
  'WhatsApp Image 2026-09-23 at 7.50.40 PM (3).jpeg',
  'WhatsApp Image 2026-09-23 at 7.50.40 PM (1).jpeg',
  'WhatsApp Image 2026-09-23 at 7.50.39 PM (2).jpeg',
  'WhatsApp Image 2026-09-23 at 7.50.40 PM.jpeg',
  'WhatsApp Image 2026-09-23 at 7.50.39 PM (1).jpeg',
  'WhatsApp Image 2026-09-23 at 7.50.40 PM (2).jpeg',
  'WhatsApp Image 2026-09-23 at 7.50.39 PM.jpeg',
];

await mkdir(outDir, { recursive: true });

for (let i = 0; i < sources.length; i++) {
  const src = path.join(root, 'assets', sources[i]);
  const out = path.join(outDir, `photo-${i + 1}.webp`);
  const width = i === 0 ? 1400 : 1100;
  await sharp(src)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(out);
  const { size } = await stat(out);
  console.log(`photo-${i + 1}.webp written (${(size / 1024).toFixed(0)} KB, max ${width}px)`);
}
console.log('Done.');
