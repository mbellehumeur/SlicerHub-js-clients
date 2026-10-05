/**
 * Copy products/*.info.json from SlicerHub (or legacy cast extension) into src/inferenceInfo/.
 * Non-fatal if products dir is missing and src/inferenceInfo already has files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(clientRoot, '../..');
const candidates = [
  path.resolve(repoRoot, '../SlicerHub/HubInterface/resource_servers/products'),
  path.resolve(repoRoot, '../slicer-cast-extension/CastInterface/cast_resource_servers/products'),
  path.resolve(repoRoot, '../cast-interface/slicer-cast-extension/CastInterface/cast_resource_servers/products'),
];
const productsDir = candidates.find((p) => fs.existsSync(p));
const outDir = path.join(clientRoot, 'src', 'inferenceInfo');

/** @type {Array<{ name: string, srcRel: string }>} */
const FILES = [
  { name: 'mhub.info.json', srcRel: path.join('mhub', 'mhub.info.json') },
  { name: 'lung_screening.info.json', srcRel: 'lung_screening.info.json' },
  { name: 'total_segmentator.info.json', srcRel: 'total_segmentator.info.json' },
  { name: 'neuro_seg.info.json', srcRel: 'neuro_seg.info.json' },
  { name: 'dental_segmentator.info.json', srcRel: 'dental_segmentator.info.json' },
  { name: 'torchxrayvision.info.json', srcRel: path.join('torchxrayvision', 'torchxrayvision.info.json') },
  { name: 'flexray.info.json', srcRel: path.join('flexray', 'flexray.info.json') },
];

function hasExistingOutputs() {
  return FILES.every(({ name }) => fs.existsSync(path.join(outDir, name)));
}

if (!productsDir) {
  if (hasExistingOutputs()) {
    console.warn('Products dir not found; keeping existing src/inferenceInfo/.');
    process.exit(0);
  }
  console.error('Products dir not found. Tried:\n' + candidates.join('\n'));
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });
for (const { name, srcRel } of FILES) {
  const src = path.join(productsDir, srcRel);
  if (!fs.existsSync(src)) {
    console.error(`Missing ${src}`);
    process.exit(1);
  }
  fs.copyFileSync(src, path.join(outDir, name));
  console.log(`Copied ${name}`);
}
console.log(`Synced ${FILES.length} inference info files → src/inferenceInfo/`);
