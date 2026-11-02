#!/usr/bin/env node
/**
 * Run SlicerHub-js-clients Testing live smokes (requires local hub).
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TESTING_ROOT = path.dirname(fileURLToPath(import.meta.url));

const SCRIPTS = [path.join(TESTING_ROOT, 'client', 'smoke_client_pubsub.js')];

function runScript(scriptPath) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [scriptPath], {
      cwd: TESTING_ROOT,
      stdio: 'inherit',
    });
    child.on('exit', (code, signal) => {
      resolve(signal ? 1 : code ?? 1);
    });
  });
}

async function main() {
  let failed = 0;
  for (const script of SCRIPTS) {
    const rel = path.relative(TESTING_ROOT, script);
    console.log('='.repeat(60));
    console.log(`RUN ${rel}`);
    console.log('='.repeat(60));
    const code = await runScript(script);
    if (code !== 0) {
      failed += 1;
      console.log(`FAILED (${code}): ${path.basename(script)}`);
    } else {
      console.log(`PASSED: ${path.basename(script)}`);
    }
  }
  console.log('='.repeat(60));
  if (failed) {
    console.log(`SUMMARY: ${failed}/${SCRIPTS.length} failed`);
    return 1;
  }
  console.log(`SUMMARY: all ${SCRIPTS.length} passed`);
  return 0;
}

process.exit(await main());
