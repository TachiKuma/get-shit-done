'use strict';

const { afterEach, describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.GSD_TEST_MODE = '1';
const { install } = require('../bin/install.js');

const ROOT = path.join(__dirname, '..');
const EN_CATALOG_PATH = path.join(ROOT, 'get-shit-done', 'locales', 'en', 'codex-skills.json');
const ZH_CATALOG_PATH = path.join(ROOT, 'get-shit-done', 'locales', 'zh-CN', 'codex-skills.json');
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

function runLocalCodexInstall(projectDir) {
  const previousCwd = process.cwd();

  try {
    process.chdir(projectDir);
    return install(false, 'codex');
  } finally {
    process.chdir(previousCwd);
  }
}

function captureInstallOutput(callback) {
  const stdout = [];
  const stderr = [];
  const originalStdoutWrite = process.stdout.write;
  const originalStderrWrite = process.stderr.write;

  process.stdout.write = function captureStdout(chunk, encoding, cb) {
    stdout.push(typeof chunk === 'string' ? chunk : chunk.toString(encoding || 'utf8'));
    if (typeof cb === 'function') cb();
    return true;
  };

  process.stderr.write = function captureStderr(chunk, encoding, cb) {
    stderr.push(typeof chunk === 'string' ? chunk : chunk.toString(encoding || 'utf8'));
    if (typeof cb === 'function') cb();
    return true;
  };

  try {
    callback();
  } finally {
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
  }

  return {
    stdout: stdout.join(''),
    stderr: stderr.join(''),
  };
}

function readInstalledSkill(projectDir, skill) {
  return fs.readFileSync(
    path.join(projectDir, '.codex', 'skills', skill, 'SKILL.md'),
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
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsd-codex-install-'));
  tempRoots.push(projectDir);
  return projectDir;
}

function assertEnglishCanonicalRetention(content, skill) {
  assert.ok(content.includes(`name: "${skill}"`), `${skill} should keep its English identifier`);
  assert.ok(content.includes('<codex_skill_adapter>'), `${skill} should keep the adapter block`);
  assert.ok(content.includes('## A. Skill Invocation'), `${skill} should keep the English adapter content`);
}

function assertInstalledFirstBatchMatchesCatalog(projectDir, catalog) {
  const skillsDir = path.join(projectDir, '.codex', 'skills');
  const installedSkills = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && FIRST_BATCH.includes(entry.name))
    .map((entry) => entry.name)
    .sort();

  assert.deepStrictEqual(installedSkills, [...FIRST_BATCH].sort());

  for (const skill of FIRST_BATCH) {
    const content = readInstalledSkill(projectDir, skill);

    assert.equal(extractDescription(content), catalog[`codex-skills.${skill}.description`]);
    assert.equal(extractShortDescription(content), catalog[`codex-skills.${skill}.short-description`]);
    assertEnglishCanonicalRetention(content, skill);
  }
}

afterEach(() => {
  while (tempRoots.length > 0) {
    fs.rmSync(tempRoots.pop(), { recursive: true, force: true });
  }
});

describe('codex install output localization', () => {
  test('local Codex install writes zh-CN frontmatter for the first-batch skills when response_language resolves to zh', () => {
    const projectDir = createTempProject();
    const zhCatalog = readCatalog(ZH_CATALOG_PATH);

    writePlanningConfig(projectDir, 'zh');
    runLocalCodexInstall(projectDir);
    assertInstalledFirstBatchMatchesCatalog(projectDir, zhCatalog);

    const planPhaseContent = readInstalledSkill(projectDir, 'gsd-plan-phase');
    assert.ok(
      planPhaseContent.includes(
        'Create executable phase prompts (PLAN.md files) for a roadmap phase with integrated research and verification.'
      ),
      'skill body should remain English canonical'
    );
  });

  test('local Codex install does not emit the misleading unreplaced .claude warning for explanatory runtime text', () => {
    const projectDir = createTempProject();

    writePlanningConfig(projectDir, 'zh-CN');
    const output = captureInstallOutput(() => {
      runLocalCodexInstall(projectDir);
    });

    assert.match(output.stdout, /正在为/);
    assert.match(output.stdout, /已生成 config\.toml/);
    assert.equal(
      /unreplaced \.claude path reference/i.test(output.stderr),
      false,
      'Codex install should not warn about explanatory .claude text'
    );
  });

  test('local Codex install writes the full English display pair for the first-batch skills when response_language is en', () => {
    const projectDir = createTempProject();
    const englishCatalog = readCatalog(EN_CATALOG_PATH);

    writePlanningConfig(projectDir, 'en');
    runLocalCodexInstall(projectDir);
    assertInstalledFirstBatchMatchesCatalog(projectDir, englishCatalog);

    const executePhaseContent = readInstalledSkill(projectDir, 'gsd-execute-phase');
    assert.ok(
      executePhaseContent.includes('Execute all plans in a phase using wave-based parallel execution.'),
      'English install should keep the workflow body English canonical'
    );
  });

  test('reinstall overwrites stale English Codex skill output with zh-CN frontmatter', () => {
    const projectDir = createTempProject();
    const staleSkillDir = path.join(projectDir, '.codex', 'skills', 'gsd-plan-phase');

    writePlanningConfig(projectDir, 'zh-CN');
    fs.mkdirSync(staleSkillDir, { recursive: true });
    fs.writeFileSync(
      path.join(staleSkillDir, 'SKILL.md'),
      [
        '---',
        'name: "gsd-plan-phase"',
        'description: "Create detailed phase plan (PLAN.md) with verification loop"',
        'metadata:',
        '  short-description: "Create a detailed phase plan and verify it before execution"',
        '---',
        '',
        'STALE BODY SHOULD BE REPLACED',
        '',
      ].join('\n'),
      'utf8'
    );

    runLocalCodexInstall(projectDir);

    const content = readInstalledSkill(projectDir, 'gsd-plan-phase');

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
    const englishCatalog = readCatalog(EN_CATALOG_PATH);

    writePlanningConfig(projectDir, 'Martian');
    runLocalCodexInstall(projectDir);

    const content = readInstalledSkill(projectDir, 'gsd-execute-phase');

    assert.equal(
      extractDescription(content),
      englishCatalog['codex-skills.gsd-execute-phase.description']
    );
    assert.equal(
      extractShortDescription(content),
      englishCatalog['codex-skills.gsd-execute-phase.short-description']
    );
    assert.ok(
      content.includes('Execute all plans in a phase using wave-based parallel execution.'),
      'fallback should not localize the workflow body'
    );
  });
});
