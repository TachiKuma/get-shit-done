'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadLocaleCatalog } = require('../get-shit-done/bin/lib/locale.cjs');

const ROOT = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

describe('template asset localization contract', () => {
  test('en and zh-CN assets catalogs keep identical key sets for first-batch templates', () => {
    const en = JSON.parse(read('get-shit-done/locales/en/assets.json'));
    const zh = JSON.parse(read('get-shit-done/locales/zh-CN/assets.json'));
    const enKeys = Object.keys(en).sort();
    const zhKeys = Object.keys(zh).sort();

    assert.deepStrictEqual(zhKeys, enKeys, 'assets locale catalogs should not drift');

    for (const prefix of ['assets.summary', 'assets.verification', 'assets.uat', 'assets.validation']) {
      assert.ok(enKeys.some(key => key.startsWith(prefix)), `missing ${prefix} keys`);
    }
  });

  test('assets locale catalog falls back to English for locales without a dedicated assets catalog', () => {
    const ptAssets = loadLocaleCatalog('assets', 'pt-BR');
    assert.equal(ptAssets['assets.summary.performance'], 'Performance');
    assert.equal(ptAssets['assets.validation.title'], 'Validation Strategy');
  });

  test('templates and workflows keep fixed-string vs generated-content hooks visible', () => {
    const files = [
      'get-shit-done/templates/summary.md',
      'get-shit-done/templates/verification-report.md',
      'get-shit-done/templates/UAT.md',
      'get-shit-done/templates/VALIDATION.md',
      'get-shit-done/workflows/execute-plan.md',
      'get-shit-done/workflows/verify-phase.md',
      'get-shit-done/workflows/verify-work.md',
      'get-shit-done/workflows/plan-phase.md',
    ];

    for (const relativePath of files) {
      const content = read(relativePath);
      assert.match(content, /assets/i, `${relativePath} should mention assets catalog usage`);
      assert.match(content, /fixed-string/i, `${relativePath} should mention fixed-string contract`);
      assert.match(content, /response_language/i, `${relativePath} should mention generated narrative contract`);
      assert.match(content, /English/i, `${relativePath} should mention English retention`);
    }
  });
});
