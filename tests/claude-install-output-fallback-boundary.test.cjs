'use strict';

const { afterEach, describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.GSD_TEST_MODE = '1';
const { install } = require('../bin/install.js');

const ROOT = path.join(__dirname, '..');
const EN_CATALOG_PATH = path.join(ROOT, 'get-shit-done', 'locales', 'en', 'claude-skills.json');
const ZH_CATALOG_PATH = path.join(ROOT, 'get-shit-done', 'locales', 'zh-CN', 'claude-skills.json');
const NON_PROMISED_SAMPLE = [
  'gsd-ingest-docs',
  'gsd-plan-review-convergence',
];

const tempRoots = [];

function readCatalog(catalogPath) {
  return JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
}

function writePlanningConfig(projectDir, responseLanguage) {
  const planningDir = path.join(projectDir, '.planning');
  fs.mkdirSync(planningDir, { recursive: true });
  fs.writeFileSync(
    path.join(planningDir, 'config.json'),
    JSON.stringify({ response_language: responseLanguage }, null, 2),
    'utf8'
  );
}

function runGlobalClaudeInstall(projectDir, configDir) {
  const previousCwd = process.cwd();
  const previousConfigDir = process.env.CLAUDE_CONFIG_DIR;

  try {
    process.chdir(projectDir);
    process.env.CLAUDE_CONFIG_DIR = configDir;
    return install(true, 'claude');
  } finally {
    process.chdir(previousCwd);
    if (previousConfigDir === undefined) {
      delete process.env.CLAUDE_CONFIG_DIR;
    } else {
      process.env.CLAUDE_CONFIG_DIR = previousConfigDir;
    }
  }
}

function readInstalledSkill(configDir, skill) {
  return fs.readFileSync(
    path.join(configDir, 'skills', skill, 'SKILL.md'),
    'utf8'
  );
}

function extractDescription(content) {
  const match = content.match(/^description:\s*"(.+)"$/m);
  return match ? match[1] : null;
}

function extractShortDescription(content) {
  const match = content.match(/^\s*short-description:\s*"(.+)"$/m);
  return match ? match[1] : null;
}

function extractFrontmatter(content) {
  const parts = content.split(/^---$/m);
  return parts.length >= 3 ? parts[1] : '';
}

function createTempProject() {
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsd-claude-fallback-project-'));
  tempRoots.push(projectDir);
  return projectDir;
}

function createTempClaudeConfigRoot() {
  const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsd-claude-fallback-config-'));
  tempRoots.push(configDir);
  return configDir;
}

function assertEnglishFallbackPair(configDir, englishCatalog) {
  for (const skill of NON_PROMISED_SAMPLE) {
    const content = readInstalledSkill(configDir, skill);
    const frontmatter = extractFrontmatter(content);

    assert.equal(
      extractDescription(content),
      englishCatalog[`claude-skills.${skill}.description`]
    );
    assert.equal(
      extractShortDescription(content),
      englishCatalog[`claude-skills.${skill}.short-description`]
    );
    assert.ok(content.includes(`name: ${skill}`), `${skill} should keep its English identifier`);
    assert.ok(frontmatter.includes('metadata:'), `${skill} should include display metadata`);
    assert.doesNotMatch(frontmatter, /[\u4e00-\u9fff]/, `${skill} frontmatter should stay English-only`);
  }
}

afterEach(() => {
  while (tempRoots.length > 0) {
    fs.rmSync(tempRoots.pop(), { recursive: true, force: true });
  }
});

describe('claude install output fallback boundary', () => {
  test('zh-CN install keeps non-promised sampled skills on the English fallback pair', () => {
    const projectDir = createTempProject();
    const configDir = createTempClaudeConfigRoot();
    const englishCatalog = readCatalog(EN_CATALOG_PATH);
    const chineseCatalog = readCatalog(ZH_CATALOG_PATH);

    writePlanningConfig(projectDir, 'zh-CN');
    runGlobalClaudeInstall(projectDir, configDir);
    assertEnglishFallbackPair(configDir, englishCatalog);

    for (const skill of NON_PROMISED_SAMPLE) {
      assert.equal(
        chineseCatalog[`claude-skills.${skill}.description`],
        undefined,
        `${skill} should remain outside the zh-CN promised subset`
      );
      assert.equal(
        chineseCatalog[`claude-skills.${skill}.short-description`],
        undefined,
        `${skill} should remain outside the zh-CN promised subset`
      );
    }
  });

  test('English install keeps the sampled non-promised skills on the English canonical pair', () => {
    const projectDir = createTempProject();
    const configDir = createTempClaudeConfigRoot();
    const englishCatalog = readCatalog(EN_CATALOG_PATH);

    writePlanningConfig(projectDir, 'en');
    runGlobalClaudeInstall(projectDir, configDir);
    assertEnglishFallbackPair(configDir, englishCatalog);
  });
});
