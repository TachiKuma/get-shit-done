'use strict';

const fs = require('fs');
const path = require('path');
const { loadLocaleCatalog } = require('../get-shit-done/bin/lib/locale.cjs');

const ROOT = path.join(__dirname, '..');

const workflowFiles = [
  'get-shit-done/workflows/discuss-phase.md',
  'get-shit-done/workflows/plan-phase.md',
  'get-shit-done/workflows/execute-phase.md',
  'get-shit-done/workflows/progress.md',
];

const docFiles = [
  'docs/CONFIGURATION.md',
  'get-shit-done/references/planning-config.md',
];

const results = [];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function record(label, ok, detail) {
  results.push({ label, ok, detail });
}

for (const relativePath of workflowFiles) {
  const content = read(relativePath);
  record(
    `workflow:${relativePath}`,
    content.includes('response_language') &&
      content.includes('canonical locale') &&
      content.includes('English'),
    'workflow keeps locale propagation, canonical locale contract, and English retention visible'
  );
}

for (const relativePath of docFiles) {
  const content = read(relativePath);
  record(
    `docs:${relativePath}`,
    content.includes('BCP 47') &&
      content.includes('"en"') &&
      content.includes('"zh-CN"') &&
      content.includes('zh-CN -> en') &&
      content.includes('English'),
    'docs keep canonical locale examples, fallback, and English retention aligned'
  );
}

const enCatalog = JSON.parse(read('get-shit-done/locales/en/runtime.json'));
const zhCatalog = JSON.parse(read('get-shit-done/locales/zh-CN/runtime.json'));
const enKeys = Object.keys(enCatalog).sort();
const zhKeys = Object.keys(zhCatalog).sort();

record(
  'catalog:key-set',
  JSON.stringify(enKeys) === JSON.stringify(zhKeys) && enKeys.every(key => key.startsWith('runtime.')),
  'en and zh-CN runtime catalogs parse and share the same runtime.* keys'
);

const zhRuntime = loadLocaleCatalog('runtime', 'zh-CN');
const ptRuntime = loadLocaleCatalog('runtime', 'pt-BR');

record(
  'catalog:fallback',
  zhRuntime['runtime.phase.complete'] === '阶段完成' &&
    ptRuntime['runtime.phase.complete'] === 'Phase complete',
  'zh-CN resolves localized values and pt-BR falls back to en'
);

const failed = results.filter(result => !result.ok);

console.log('Locale Runtime Smoke Verification');
console.log(`Root: ${ROOT}`);
console.log('');

for (const result of results) {
  console.log(`[${result.ok ? 'PASS' : 'FAIL'}] ${result.label}`);
  console.log(`  ${result.detail}`);
}

console.log('');

if (failed.length > 0) {
  console.log(`FAIL: ${failed.length}/${results.length} checks failed`);
  process.exit(1);
}

console.log(`PASS: ${results.length}/${results.length} checks passed`);

