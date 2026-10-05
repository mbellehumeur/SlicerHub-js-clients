#!/usr/bin/env node
/**
 * Copy HubClient library modules from vtk-js (exclude example/ and vtk.js deps).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VTK_CAST = path.resolve(
  __dirname,
  '../../../ProjectWeek45/vtk-js/Sources/IO/Core/HubClient'
);
const DEST_SRC = path.resolve(__dirname, '../src');

const SKIP = new Set(['example', 'CONSOLIDATION_PLAN.md']);

function copyLibraryModules() {
  fs.mkdirSync(DEST_SRC, { recursive: true });
  for (const name of fs.readdirSync(VTK_CAST)) {
    if (SKIP.has(name)) continue;
    const src = path.join(VTK_CAST, name);
    const stat = fs.statSync(src);
    if (stat.isFile() && name.endsWith('.js') && name !== 'index.js') {
      fs.copyFileSync(src, path.join(DEST_SRC, name));
      console.log('copied', name);
    }
  }
}

function patchIndexJs() {
  let src = fs.readFileSync(path.join(VTK_CAST, 'index.js'), 'utf8');
  src = src.replace(
    "import macro from 'vtk.js/Sources/macros';",
    "import * as factory from './objectFactory.js';"
  );
  src = src.replaceAll('macro.chain', 'factory.chain');
  src = src.replaceAll('macro.obj', 'factory.obj');
  src = src.replaceAll('macro.get', 'factory.get');
  src = src.replaceAll('macro.newInstance', 'factory.newInstance');
  fs.writeFileSync(path.join(DEST_SRC, 'index.js'), src);
  console.log('patched index.js');
}

function patchIndexDts() {
  let src = fs.readFileSync(path.join(VTK_CAST, 'index.d.ts'), 'utf8');
  src = src.replace(
    "import { vtkObject } from '../../../interfaces';\n\n",
    ''
  );
  src = src.replace(
    'export interface HubClient extends vtkObject {',
    'export interface HubClientInstance {\n  getClassName(): string;\n  isA(className: string): boolean;'
  );
  src = src.replace(
    'export function newInstance(initialValues?: HubClientConfig): HubClient;',
    'export function newInstance(initialValues?: HubClientConfig): HubClientInstance;'
  );
  src = src.replace(
    " * import HubClient, { generateSubscriberName } from '@kitware/vtk.js/Sources/IO/Core/HubClient';",
    " * import HubClient, { generateSubscriberName } from '@slicer-hub/client';"
  );
  src = src.replace(
    " * import { requestEventFor } from '@kitware/vtk.js/Sources/IO/Core/HubClient/eventNames';",
    " * import { requestEventFor } from '@slicer-hub/client';"
  );
  src = src.replace(
    ' * const client = HubClient.newInstance({',
    ' * const client = HubClient.newInstance({'
  );
  src = src.replace(
    ' * @see /examples/HubClient.html',
    ' * @see hub-worklist-example'
  );
  src = src.replace(
    'export declare const HubClient:',
    'export declare const HubClient:'
  );
  src = src.replace('export default HubClient;', 'export default HubClient;');
  fs.writeFileSync(path.join(DEST_SRC, 'index.d.ts'), src);
  console.log('patched index.d.ts');
}

copyLibraryModules();
patchIndexJs();
patchIndexDts();
