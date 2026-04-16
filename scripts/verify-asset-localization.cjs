'use strict';

const fs = require('fs');
const path = require('path');
const { loadLocaleCatalog } = require('../get-shit-done/bin/lib/locale.cjs');

const ROOT = path.join(__dirname, '..');
const results = [];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function record(label, ok, detail) {
  results.push({ label, ok, detail });
}

const zhCommands = read('docs/zh-CN/COMMANDS.md');
record(
  'docs:zh-CN-command-summary',
  ['/gsd-progress', '/gsd-discuss-phase', '/gsd-plan-phase', '/gsd-execute-phase', '/gsd-next', '../COMMANDS.md'].every(token => zhCommands.includes(token)),
  'zh-CN command summary covers the first-batch commands and links to English canonical docs'
);

for (const relativePath of ['docs/ja-JP/COMMANDS.md', 'docs/ko-KR/COMMANDS.md', 'docs/pt-BR/COMMANDS.md']) {
  const content = read(relativePath);
  record(
    `docs:${relativePath}`,
    content.includes('../COMMANDS.md') &&
      content.includes('English canonical') &&
      /summary|要約|resumo/i.test(content),
    'non-first-batch locale keeps summary-only skeleton with explicit English fallback'
  );
}

const zhReadme = read('docs/zh-CN/README.md');
record(
  'docs:zh-CN-readme-nav',
  zhReadme.includes('[命令摘要](COMMANDS.md)') &&
    zhReadme.includes('[English canonical 命令参考](../COMMANDS.md)'),
  'zh-CN docs index points to localized summary and still exposes English canonical detail'
);

const enAssets = JSON.parse(read('get-shit-done/locales/en/assets.json'));
const zhAssets = JSON.parse(read('get-shit-done/locales/zh-CN/assets.json'));
const enKeys = Object.keys(enAssets).sort();
const zhKeys = Object.keys(zhAssets).sort();

record(
  'catalog:key-parity',
  JSON.stringify(enKeys) === JSON.stringify(zhKeys),
  'en and zh-CN assets catalogs share the same fixed-string key set'
);

const ptAssets = loadLocaleCatalog('assets', 'pt-BR');
record(
  'catalog:fallback',
  ptAssets['assets.summary.performance'] === 'Performance' &&
    ptAssets['assets.verification.title'] === 'Verification Report',
  'locales without dedicated assets catalogs fall back to English values'
);

for (const relativePath of [
  'get-shit-done/templates/summary.md',
  'get-shit-done/templates/verification-report.md',
  'get-shit-done/templates/UAT.md',
  'get-shit-done/templates/VALIDATION.md',
  'get-shit-done/workflows/execute-plan.md',
  'get-shit-done/workflows/verify-phase.md',
  'get-shit-done/workflows/verify-work.md',
  'get-shit-done/workflows/plan-phase.md',
]) {
  const content = read(relativePath);
  record(
    `contract:${relativePath}`,
    /assets/i.test(content) &&
      /fixed-string/i.test(content) &&
      /response_language/i.test(content) &&
      /English/i.test(content),
    'template/workflow keeps the fixed-string vs generated narrative contract visible'
  );
}

const failed = results.filter(result => !result.ok);

console.log('Asset Localization Smoke Verification');
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
