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
const FIRST_BATCH = [
  'gsd-new-milestone',
  'gsd-progress',
  'gsd-discuss-phase',
  'gsd-plan-phase',
  'gsd-execute-phase',
  'gsd-next',
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

function createTempProject() {
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsd-claude-install-'));
  tempRoots.push(projectDir);
  return projectDir;
}

function createTempClaudeConfigRoot() {
  const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsd-claude-config-'));
  tempRoots.push(configDir);
  return configDir;
}

function assertEnglishCanonicalRetention(content, skill) {
  assert.ok(content.includes(`name: ${skill}`), `${skill} should keep its English identifier`);
  assert.ok(content.includes('metadata:'), `${skill} should include localized display metadata`);
}

function assertInstalledFirstBatchMatchesCatalog(configDir, catalog) {
  const skillsDir = path.join(configDir, 'skills');
  const installedSkills = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && FIRST_BATCH.includes(entry.name))
    .map((entry) => entry.name)
    .sort();

  assert.deepStrictEqual(installedSkills, [...FIRST_BATCH].sort());

  for (const skill of FIRST_BATCH) {
    const content = readInstalledSkill(configDir, skill);

    assert.equal(extractDescription(content), catalog[`claude-skills.${skill}.description`]);
    assert.equal(extractShortDescription(content), catalog[`claude-skills.${skill}.short-description`]);
    assertEnglishCanonicalRetention(content, skill);
  }
}

function withMockedCatalogRead(overrides, callback) {
  const originalReadFileSync = fs.readFileSync;
  const normalizedOverrides = new Map(
    Object.entries(overrides).map(([catalogPath, contents]) => [path.resolve(catalogPath), contents])
  );

  fs.readFileSync = function mockedReadFileSync(filePath, options) {
    const resolvedPath = path.resolve(String(filePath));
    if (normalizedOverrides.has(resolvedPath)) {
      return normalizedOverrides.get(resolvedPath);
    }
    return originalReadFileSync.call(this, filePath, options);
  };

  try {
    return callback();
  } finally {
    fs.readFileSync = originalReadFileSync;
  }
}

afterEach(() => {
  while (tempRoots.length > 0) {
    fs.rmSync(tempRoots.pop(), { recursive: true, force: true });
  }
});

describe('claude install output localization', () => {
  test('global Claude skills install writes zh-CN frontmatter for the first-batch skills when response_language resolves to zh', () => {
    const projectDir = createTempProject();
    const configDir = createTempClaudeConfigRoot();
    const zhCatalog = readCatalog(ZH_CATALOG_PATH);

    writePlanningConfig(projectDir, 'zh');
    runGlobalClaudeInstall(projectDir, configDir);
    assertInstalledFirstBatchMatchesCatalog(configDir, zhCatalog);

    const planPhaseContent = readInstalledSkill(configDir, 'gsd-plan-phase');
    assert.ok(
      planPhaseContent.includes(
        'Create executable phase prompts (PLAN.md files) for a roadmap phase with integrated research and verification.'
      ),
      'skill body should remain English canonical'
    );
  });

  test('global Claude skills install writes the full English display pair when response_language is en', () => {
    const projectDir = createTempProject();
    const configDir = createTempClaudeConfigRoot();
    const englishCatalog = readCatalog(EN_CATALOG_PATH);

    writePlanningConfig(projectDir, 'en');
    runGlobalClaudeInstall(projectDir, configDir);
    assertInstalledFirstBatchMatchesCatalog(configDir, englishCatalog);

    const executePhaseContent = readInstalledSkill(configDir, 'gsd-execute-phase');
    assert.ok(
      executePhaseContent.includes('Execute all plans in a phase using wave-based parallel execution.'),
      'English install should keep the workflow body English canonical'
    );
  });

  test('reinstall overwrites stale English Claude skill output with zh-CN frontmatter', () => {
    const projectDir = createTempProject();
    const configDir = createTempClaudeConfigRoot();
    const staleSkillDir = path.join(configDir, 'skills', 'gsd-plan-phase');

    writePlanningConfig(projectDir, 'zh-CN');
    fs.mkdirSync(staleSkillDir, { recursive: true });
    fs.writeFileSync(
      path.join(staleSkillDir, 'SKILL.md'),
      [
        '---',
        'name: gsd-plan-phase',
        'description: "Create detailed phase plan (PLAN.md) with verification loop"',
        'metadata:',
        '  short-description: "Create detailed phase plan (PLAN.md) with verification loop"',
        '---',
        '',
        'STALE BODY SHOULD BE REPLACED',
        '',
      ].join('\n'),
      'utf8'
    );

    runGlobalClaudeInstall(projectDir, configDir);

    const content = readInstalledSkill(configDir, 'gsd-plan-phase');

    assert.equal(extractDescription(content), '创建详细阶段计划（PLAN.md），并完成执行前验证闭环');
    assert.equal(extractShortDescription(content), '创建阶段计划并完成执行前验证');
    assert.ok(!content.includes('STALE BODY SHOULD BE REPLACED'), 'reinstall should remove stale body content');
    assert.ok(
      content.includes(
        'Create executable phase prompts (PLAN.md files) for a roadmap phase with integrated research and verification.'
      )
    );
  });

  test('unsupported response_language falls back to the full English display pair while keeping the body English', () => {
    const projectDir = createTempProject();
    const configDir = createTempClaudeConfigRoot();
    const englishCatalog = readCatalog(EN_CATALOG_PATH);

    writePlanningConfig(projectDir, 'Martian');
    runGlobalClaudeInstall(projectDir, configDir);

    const content = readInstalledSkill(configDir, 'gsd-execute-phase');

    assert.equal(
      extractDescription(content),
      englishCatalog['claude-skills.gsd-execute-phase.description']
    );
    assert.equal(
      extractShortDescription(content),
      englishCatalog['claude-skills.gsd-execute-phase.short-description']
    );
    assert.ok(
      content.includes('Execute all plans in a phase using wave-based parallel execution.'),
      'fallback should not localize the workflow body'
    );
  });

  test('partial locale data falls back to the English pair in generated skill output', () => {
    const projectDir = createTempProject();
    const configDir = createTempClaudeConfigRoot();
    const englishCatalog = readCatalog(EN_CATALOG_PATH);
    const partialCatalog = {
      'claude-skills.gsd-execute-phase.description': '仅有中文 description',
    };

    writePlanningConfig(projectDir, 'zh-CN');
    withMockedCatalogRead(
      {
        [ZH_CATALOG_PATH]: JSON.stringify(partialCatalog, null, 2),
      },
      () => {
        runGlobalClaudeInstall(projectDir, configDir);
      }
    );

    const content = readInstalledSkill(configDir, 'gsd-execute-phase');

    assert.equal(
      extractDescription(content),
      englishCatalog['claude-skills.gsd-execute-phase.description']
    );
    assert.equal(
      extractShortDescription(content),
      englishCatalog['claude-skills.gsd-execute-phase.short-description']
    );
    assert.equal(content.includes('仅有中文 description'), false);
  });
});
