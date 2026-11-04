// Shrinks every regulator logo in public/regulators to a small PNG.
// The rows show logos at 36 to 40px, so 96px covers sharp (2x) screens, and a
// palette PNG at that size is a few KB. Run with: npm run logos
import { readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const DIR = path.join(process.cwd(), 'public', 'regulators');
const SIZE = 96;
const IMAGE = /\.(png|jpe?g|gif|webp|svg)$/i;

const files = (await readdir(DIR)).filter(f => IMAGE.test(f));
if (files.length === 0) {
  console.log('No images in public/regulators.');
  process.exit(0);
}

for (const file of files) {
  const src = path.join(DIR, file);
  const name = path.parse(file).name;
  const out = path.join(DIR, `${name}.png`);
  const before = (await stat(src)).size;
  const png = await sharp(src, { density: 300, animated: false })
    .resize(SIZE, SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ palette: true, quality: 85, compressionLevel: 9, effort: 10 })
    .toBuffer();
  await writeFile(out, png);
  if (out !== src) await rm(src);
  const kb = n => `${(n / 1024).toFixed(1)} KB`;
  console.log(`${file.padEnd(20)} ${kb(before).padStart(10)}  ->  ${name}.png ${kb(png.length)}`);
}
