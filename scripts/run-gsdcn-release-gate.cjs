#!/usr/bin/env node
'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const FOCUSED_TESTS = [
  'tests/package-identity-gsdcn.test.cjs',
  'tests/gsdcn-install-brand-e2e.test.cjs',
  'tests/gsdcn-installer-ux-contract.test.cjs',
  'tests/gsdcn-official-fallback-boundary.test.cjs',
  'tests/installer-namespace-coexistence.test.cjs',
  'tests/npm-pack-artifact-gsdcn.test.cjs',
  'tests/npm-pack-tarball-smoke-gsdcn.test.cjs',
  'tests/package-manifest.test.cjs',
  'tests/gsdcn-runtime-surface-contract.test.cjs',
  'tests/gsdcn-surface-parity.test.cjs',
];

const CATEGORIES = [
  'package metadata and README install drift',
  'GSD-CN install activation and official fallback',
  'installer UX and locale boundaries',
  'namespace coexistence',
  'npm pack dry-run and temp tarball smoke',
  'runtime/package manifest regressions',
];

function assertFilesExist(files) {
  const missing = files.filter(file => !fs.existsSync(path.join(ROOT, file)));
  if (missing.length > 0) {
    console.error('Missing focused gate test file(s):');
    for (const file of missing) console.error(`  - ${file}`);
    process.exit(1);
  }
}

console.log('GSD-CN focused release gate');
console.log('Coverage:');
for (const category of CATEGORIES) console.log(`  - ${category}`);
console.log('\nTests:');
for (const file of FOCUSED_TESTS) console.log(`  - ${file}`);
console.log('');

assertFilesExist(FOCUSED_TESTS);

try {
  execFileSync(process.execPath, ['--test', ...FOCUSED_TESTS], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env },
  });
} catch (error) {
  process.exit(error.status || 1);
}
