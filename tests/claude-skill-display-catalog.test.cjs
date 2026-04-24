'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COMMANDS_ROOT = path.join(ROOT, 'commands', 'gsd');
const EN_CATALOG_PATH = path.join(ROOT, 'get-shit-done', 'locales', 'en', 'claude-skills.json');
const ZH_CATALOG_PATH = path.join(ROOT, 'get-shit-done', 'locales', 'zh-CN', 'claude-skills.json');
const FORBIDDEN_KEY_FRAGMENTS = ['body', 'flag', 'path', 'tool', 'allowed-tools', 'argument-hint', 'name'];

function walkCommands(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkCommands(full));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out.sort();
}

function expectedEnglishSkills() {
  return walkCommands(COMMANDS_ROOT).map((file) => {
    const relative = path.relative(COMMANDS_ROOT, file).replace(/\\/g, '/').replace(/\.md$/, '');
    return `gsd-${relative.replace(/\//g, '-')}`;
  }).sort();
}

function readCatalog(catalogPath) {
  return JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
}

function extractSkillIds(catalog) {
  return [...new Set(Object.keys(catalog).map((key) => key.split('.')[1]))].sort();
}

function getDisplayPair(catalog, namespace, skill) {
  return {
    description: catalog[`${namespace}.${skill}.description`],
    shortDescription: catalog[`${namespace}.${skill}.short-description`],
  };
}

describe('claude skill display catalog contract', () => {
  test('English claude-skills catalog covers the current command inventory exactly', () => {
    const catalog = readCatalog(EN_CATALOG_PATH);
    const expectedSkills = expectedEnglishSkills();

    assert.deepStrictEqual(extractSkillIds(catalog), expectedSkills);
  });

  test('English claude-skills catalog provides exactly one display pair per skill', () => {
    const catalog = readCatalog(EN_CATALOG_PATH);
    const expectedKeys = expectedEnglishSkills().flatMap((skill) => [
      `claude-skills.${skill}.description`,
      `claude-skills.${skill}.short-description`,
    ]).sort();

    assert.deepStrictEqual(Object.keys(catalog).sort(), expectedKeys);
  });

  test('English and zh-CN catalogs stay inside the display-layer field boundary', () => {
    const englishCatalog = readCatalog(EN_CATALOG_PATH);
    const chineseCatalog = readCatalog(ZH_CATALOG_PATH);

    for (const catalog of [englishCatalog, chineseCatalog]) {
      for (const key of Object.keys(catalog)) {
        assert.match(key, /^claude-skills\.gsd-[a-z0-9_-]+\.(description|short-description)$/);
        for (const fragment of FORBIDDEN_KEY_FRAGMENTS) {
          assert.equal(key.includes(fragment), false, `${key} should not include ${fragment}`);
        }
      }
    }
  });

  test('zh-CN claude-skills catalog covers the current command inventory exactly', () => {
    const chineseCatalog = readCatalog(ZH_CATALOG_PATH);
    const expectedSkills = expectedEnglishSkills();

    assert.deepStrictEqual(extractSkillIds(chineseCatalog), expectedSkills);
  });

  test('zh-CN claude-skills catalog provides exactly one display pair per skill', () => {
    const chineseCatalog = readCatalog(ZH_CATALOG_PATH);
    const expectedKeys = expectedEnglishSkills().flatMap((skill) => [
      `claude-skills.${skill}.description`,
      `claude-skills.${skill}.short-description`,
    ]).sort();

    assert.deepStrictEqual(Object.keys(chineseCatalog).sort(), expectedKeys);
  });

  test('zh-CN values are non-empty Chinese strings with shorter short-descriptions', () => {
    const chineseCatalog = readCatalog(ZH_CATALOG_PATH);

    for (const skill of expectedEnglishSkills()) {
      const { description, shortDescription } = getDisplayPair(chineseCatalog, 'claude-skills', skill);

      assert.equal(typeof description, 'string');
      assert.equal(typeof shortDescription, 'string');
      assert.ok(description.trim().length > 0, `${skill} description should not be empty`);
      assert.ok(shortDescription.trim().length > 0, `${skill} short-description should not be empty`);
      assert.match(description, /[\u4e00-\u9fff]/, `${skill} description should contain Chinese text`);
      assert.match(shortDescription, /[\u4e00-\u9fff]/, `${skill} short-description should contain Chinese text`);
      assert.ok(shortDescription.length < description.length, `${skill} short-description should be shorter than description`);
    }
  });
});
