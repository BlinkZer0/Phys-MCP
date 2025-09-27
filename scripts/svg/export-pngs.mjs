import { readdirSync, mkdirSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const IN = 'assets/svg/headers';
const OUT = 'assets/png/headers';
mkdirSync(OUT, { recursive: true });

const files = readdirSync(IN).filter(f => f.endsWith('.svg'));
for (const f of files) {
  const base = parse(f).name;
  const inPath = join(IN, f);
  const outPath = join(OUT, base + '.png');
  await sharp(inPath).png({ compressionLevel: 9 }).toFile(outPath);
  console.log(`Exported ${outPath}`);
}
