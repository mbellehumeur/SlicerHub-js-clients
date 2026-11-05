#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.copyFileSync(
  path.join(root, 'src', 'index.d.ts'),
  path.join(root, 'dist', 'index.d.ts')
);
console.log('copied index.d.ts -> dist/');
