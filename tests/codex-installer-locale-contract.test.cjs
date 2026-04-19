'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.GSD_TEST_MODE = '1';
const INSTALL_MODULE_PATH = require.resolve('../bin/install.js');
const {
  convertClaudeCommandToCodexSkill,
  resolveInstallerLocale,
} = require('../bin/install.js');

const SAMPLE_COMMAND = `---
name: gsd:plan-phase
description: Create detailed phase plan (PLAN.md) with verification loop
---
<objective>
Create executable phase prompts (PLAN.md files).
</objective>
`;

function extractDescription(content) {
  const match = content.match(/^description:\s*"(.+)"$/m);
  return match ? match[1] : null;
}

function stripAnsi(value) {
  return value.replace(/\x1B\[[0-9;]*m/g, '');
}

function captureStdout(callback) {
  const chunks = [];
  const originalWrite = process.stdout.write;
  process.stdout.write = function capture(chunk, encoding, cb) {
    chunks.push(typeof chunk === 'string' ? chunk : chunk.toString(encoding || 'utf8'));
    if (typeof cb === 'function') cb();
    return true;
  };

  try {
    callback();
  } finally {
    process.stdout.write = originalWrite;
  }

  return chunks.join('');
}

describe('codex installer locale contract', () => {
  test('importing the installer module in GSD_TEST_MODE stays quiet', () => {
    const output = captureStdout(() => {
      delete require.cache[INSTALL_MODULE_PATH];
      require(INSTALL_MODULE_PATH);
      delete require.cache[INSTALL_MODULE_PATH];
    });

    assert.equal(stripAnsi(output).trim(), '');
  });

  test('resolver reads response_language from project planning config and falls back to en', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsd-codex-locale-'));
    fs.mkdirSync(path.join(tempDir, '.planning'), { recursive: true });
    fs.writeFileSync(
      path.join(tempDir, '.planning', 'config.json'),
      JSON.stringify({ response_language: 'zh' }, null, 2),
      'utf8'
    );

    assert.equal(resolveInstallerLocale(tempDir), 'zh-CN');
    assert.equal(resolveInstallerLocale(path.join(tempDir, 'missing-project')), 'en');
  });

  test('real zh-CN catalog localizes first-batch frontmatter while leaving the skill body in English', () => {
    const output = convertClaudeCommandToCodexSkill(SAMPLE_COMMAND, 'gsd-plan-phase', { locale: 'zh-CN' });

    assert.equal(
      extractDescription(output),
      '创建详细阶段计划（PLAN.md），并完成执行前验证闭环'
    );
    assert.ok(output.includes('short-description: "创建阶段计划并完成执行前验证"'));
    assert.ok(output.includes('<objective>'));
    assert.ok(output.includes('Create executable phase prompts (PLAN.md files).'));
  });

  test('missing locale bundle falls back cleanly to English catalog without mutating the skill body', () => {
    const output = convertClaudeCommandToCodexSkill(SAMPLE_COMMAND, 'gsd-plan-phase', { locale: 'ko-KR' });

    assert.equal(
      extractDescription(output),
      'Create detailed phase plan (PLAN.md) with verification loop'
    );
    assert.ok(output.includes('short-description: "Create a detailed phase plan and verify it before execution"'));
    assert.ok(output.includes('<objective>'));
    assert.ok(output.includes('Create executable phase prompts (PLAN.md files).'));
  });

  test('locale-specific metadata only changes frontmatter summary fields when both locale values exist', () => {
    const resolver = (namespace, locale, key) => {
      if (namespace !== 'codex-skills') return null;
      const localeData = {
        'codex-skills.gsd-plan-phase.description': { value: '创建详细阶段计划并进入验证循环', sourceLocale: 'zh-CN' },
        'codex-skills.gsd-plan-phase.short-description': { value: '创建详细阶段计划并在执行前完成验证', sourceLocale: 'zh-CN' },
      };
      const englishData = {
        'codex-skills.gsd-plan-phase.description': { value: 'Create detailed phase plan (PLAN.md) with verification loop', sourceLocale: 'en' },
        'codex-skills.gsd-plan-phase.short-description': { value: 'Create a detailed phase plan and verify it before execution', sourceLocale: 'en' },
      };

      if (locale === 'zh-CN' && localeData[key]) return localeData[key];
      if (locale === 'en' && englishData[key]) return englishData[key];
      return null;
    };

    const output = convertClaudeCommandToCodexSkill(SAMPLE_COMMAND, 'gsd-plan-phase', {
      locale: 'zh-CN',
      catalogResolver: resolver,
    });

    assert.equal(extractDescription(output), '创建详细阶段计划并进入验证循环');
    assert.ok(output.includes('short-description: "创建详细阶段计划并在执行前完成验证"'));
    assert.ok(output.includes('<codex_skill_adapter>'));
    assert.ok(output.includes('<objective>'));
  });

  test('partial locale data falls back to the English pair instead of producing mixed-language frontmatter', () => {
    const resolver = (namespace, locale, key) => {
      if (namespace !== 'codex-skills') return null;
      if (locale === 'zh-CN' && key.endsWith('.description')) {
        return { value: '仅有中文 description', sourceLocale: 'zh-CN' };
      }
      if (locale === 'en' && key.endsWith('.description')) {
        return { value: 'Create detailed phase plan (PLAN.md) with verification loop', sourceLocale: 'en' };
      }
      if (locale === 'en' && key.endsWith('.short-description')) {
        return { value: 'Create a detailed phase plan and verify it before execution', sourceLocale: 'en' };
      }
      return null;
    };

    const output = convertClaudeCommandToCodexSkill(SAMPLE_COMMAND, 'gsd-plan-phase', {
      locale: 'zh-CN',
      catalogResolver: resolver,
    });

    assert.equal(
      extractDescription(output),
      'Create detailed phase plan (PLAN.md) with verification loop'
    );
    assert.ok(output.includes('short-description: "Create a detailed phase plan and verify it before execution"'));
    assert.equal(output.includes('仅有中文 description'), false);
  });

  test('when catalog data is missing entirely, converter falls back to extracted English frontmatter', () => {
    const output = convertClaudeCommandToCodexSkill(SAMPLE_COMMAND, 'gsd-plan-phase', {
      locale: 'zh-CN',
      catalogResolver: () => null,
    });

    assert.equal(
      extractDescription(output),
      'Create detailed phase plan (PLAN.md) with verification loop'
    );
    assert.ok(output.includes('short-description: "Create detailed phase plan (PLAN.md) with verification loop"'));
  });
});
