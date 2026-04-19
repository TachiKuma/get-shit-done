'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CATALOG_PATH = path.join(ROOT, 'get-shit-done', 'locales', 'en', 'codex-skills.json');
const FIRST_BATCH = [
  'gsd-new-milestone',
  'gsd-progress',
  'gsd-discuss-phase',
  'gsd-plan-phase',
  'gsd-execute-phase',
  'gsd-next',
];

function readCatalog() {
  return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
}

function extractSkillIds(catalog) {
  return [...new Set(Object.keys(catalog).map((key) => key.split('.')[1]))].sort();
}

describe('codex skill display catalog contract', () => {
  test('English codex-skills catalog contains exactly the first-batch description pairs', () => {
    const catalog = readCatalog();
    const expectedKeys = FIRST_BATCH.flatMap((skill) => [
      `codex-skills.${skill}.description`,
      `codex-skills.${skill}.short-description`,
    ]).sort();

    assert.deepStrictEqual(Object.keys(catalog).sort(), expectedKeys);
  });

  test('English codex-skills catalog keeps the official six-skill boundary only', () => {
    const catalog = readCatalog();

    assert.equal(FIRST_BATCH.length, 6, 'first-batch contract should stay at six skills');
    assert.deepStrictEqual(extractSkillIds(catalog), [...FIRST_BATCH].sort());
  });

  test('all catalog entries are non-empty strings in the codex-skills namespace', () => {
    const catalog = readCatalog();

    for (const [key, value] of Object.entries(catalog)) {
      assert.match(key, /^codex-skills\.gsd-[a-z0-9-]+\.(description|short-description)$/);
      assert.equal(typeof value, 'string');
      assert.ok(value.trim().length > 0, `${key} should not be empty`);
    }
  });

  test('catalog does not introduce body, flags, path, or identifier localization keys', () => {
    const catalog = readCatalog();
    const forbiddenFragments = ['body', 'flag', 'path', 'tool', 'allowed-tools', 'argument-hint', 'name'];

    for (const key of Object.keys(catalog)) {
      for (const fragment of forbiddenFragments) {
        assert.equal(key.includes(fragment), false, `${key} should not include ${fragment}`);
      }
    }
  });
});
