'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EN_CATALOG_PATH = path.join(ROOT, 'get-shit-done', 'locales', 'en', 'claude-skills.json');
const ZH_CATALOG_PATH = path.join(ROOT, 'get-shit-done', 'locales', 'zh-CN', 'claude-skills.json');
const FIRST_BATCH = [
  'gsd-new-milestone',
  'gsd-progress',
  'gsd-discuss-phase',
  'gsd-plan-phase',
  'gsd-execute-phase',
  'gsd-next',
];
const EXPECTED_PREFIXES = {
  'gsd-new-milestone': ['启动', '启动'],
  'gsd-progress': ['检查', '检查'],
  'gsd-discuss-phase': ['在规划前收集', '收集'],
  'gsd-plan-phase': ['创建', '创建'],
  'gsd-execute-phase': ['按 wave 执行', '按 wave 执行'],
  'gsd-next': ['根据当前 GSD 状态自动推进', '自动推进'],
};
const FORBIDDEN_KEY_FRAGMENTS = ['body', 'flag', 'path', 'tool', 'allowed-tools', 'argument-hint', 'name'];
const FORBIDDEN_VALUE_FRAGMENTS = [
  'English canonical',
  '什么时候用',
  '你会得到什么',
  '进一步阅读',
  '本页',
];

function readCatalog(catalogPath) {
  return JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
}

function extractSkillIds(catalog) {
  return [...new Set(Object.keys(catalog).map((key) => key.split('.')[1]))].sort();
}

function expectedLocalizedKeys() {
  return FIRST_BATCH.flatMap((skill) => [
    `claude-skills.${skill}.description`,
    `claude-skills.${skill}.short-description`,
  ]).sort();
}

function getDisplayPair(catalog, skill) {
  return {
    description: catalog[`claude-skills.${skill}.description`],
    shortDescription: catalog[`claude-skills.${skill}.short-description`],
  };
}

describe('claude skill display localization catalog', () => {
  test('zh-CN catalog stays at the official first-batch six-skill boundary', () => {
    const chineseCatalog = readCatalog(ZH_CATALOG_PATH);

    assert.equal(FIRST_BATCH.length, 6, 'first-batch contract should stay at six skills');
    assert.deepStrictEqual(extractSkillIds(chineseCatalog), [...FIRST_BATCH].sort());
    assert.deepStrictEqual(Object.keys(chineseCatalog).sort(), expectedLocalizedKeys());
  });

  test('English catalog provides the same display-pair keys for the promised subset', () => {
    const englishCatalog = readCatalog(EN_CATALOG_PATH);

    for (const key of expectedLocalizedKeys()) {
      assert.equal(typeof englishCatalog[key], 'string', `${key} should exist in English catalog`);
      assert.ok(englishCatalog[key].trim().length > 0, `${key} should not be empty in English catalog`);
    }
  });

  test('zh-CN catalog stays inside the display-layer field boundary', () => {
    const chineseCatalog = readCatalog(ZH_CATALOG_PATH);

    for (const key of Object.keys(chineseCatalog)) {
      assert.match(key, /^claude-skills\.gsd-[a-z0-9_-]+\.(description|short-description)$/);
      for (const fragment of FORBIDDEN_KEY_FRAGMENTS) {
        assert.equal(key.includes(fragment), false, `${key} should not include ${fragment}`);
      }
    }
  });

  test('zh-CN values are non-empty, localized, and more compact in short-description', () => {
    const englishCatalog = readCatalog(EN_CATALOG_PATH);
    const chineseCatalog = readCatalog(ZH_CATALOG_PATH);

    for (const skill of FIRST_BATCH) {
      const { description, shortDescription } = getDisplayPair(chineseCatalog, skill);
      const englishPair = getDisplayPair(englishCatalog, skill);

      assert.equal(typeof description, 'string');
      assert.equal(typeof shortDescription, 'string');
      assert.ok(description.trim().length > 0, `${skill} description should not be empty`);
      assert.ok(shortDescription.trim().length > 0, `${skill} short-description should not be empty`);
      assert.match(description, /[\u4e00-\u9fff]/, `${skill} description should contain Chinese text`);
      assert.match(shortDescription, /[\u4e00-\u9fff]/, `${skill} short-description should contain Chinese text`);
      assert.notEqual(description, englishPair.description, `${skill} description should not stay in English`);
      assert.notEqual(shortDescription, englishPair.shortDescription, `${skill} short-description should not stay in English`);
      assert.ok(
        shortDescription.length < description.length,
        `${skill} short-description should be shorter than description`
      );
    }
  });

  test('zh-CN wording stays action-oriented and avoids copied summary-doc prose', () => {
    const chineseCatalog = readCatalog(ZH_CATALOG_PATH);

    for (const skill of FIRST_BATCH) {
      const { description, shortDescription } = getDisplayPair(chineseCatalog, skill);
      const [descriptionPrefix, shortPrefix] = EXPECTED_PREFIXES[skill];

      assert.ok(
        description.startsWith(descriptionPrefix),
        `${skill} description should start with ${descriptionPrefix}`
      );
      assert.ok(
        shortDescription.startsWith(shortPrefix),
        `${skill} short-description should start with ${shortPrefix}`
      );

      for (const fragment of FORBIDDEN_VALUE_FRAGMENTS) {
        assert.equal(
          description.includes(fragment) || shortDescription.includes(fragment),
          false,
          `${skill} should not contain copied summary-doc phrase ${fragment}`
        );
      }
    }
  });
});
