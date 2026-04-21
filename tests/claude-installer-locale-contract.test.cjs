'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.GSD_TEST_MODE = '1';
const {
  convertClaudeCommandToClaudeSkill,
  resolveInstallerLocale,
} = require('../bin/install.js');

const SAMPLE_COMMAND = `---
name: gsd:plan-phase
description: Create detailed phase plan (PLAN.md) with verification loop
argument-hint: "[phase number]"
agent: gsd-planner
allowed-tools:
  - Read
  - Bash
---
<objective>
Create executable phase prompts (PLAN.md files).
</objective>
`;

function extractDescription(content) {
  const match = content.match(/^description:\s*"(.+)"$/m);
  return match ? match[1] : null;
}

function extractShortDescription(content) {
  const match = content.match(/^\s*short-description:\s*"(.+)"$/m);
  return match ? match[1] : null;
}

describe('claude installer locale contract', () => {
  test('resolver reads response_language from project planning config and falls back to en', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsd-claude-locale-'));
    fs.mkdirSync(path.join(tempDir, '.planning'), { recursive: true });
    fs.writeFileSync(
      path.join(tempDir, '.planning', 'config.json'),
      JSON.stringify({ response_language: 'zh' }, null, 2),
      'utf8'
    );

    assert.equal(resolveInstallerLocale(tempDir), 'zh-CN');
    assert.equal(resolveInstallerLocale(path.join(tempDir, 'missing-project')), 'en');
  });

  test('real zh-CN catalog localizes Claude frontmatter while preserving body and non-display fields', () => {
    const output = convertClaudeCommandToClaudeSkill(SAMPLE_COMMAND, 'gsd-plan-phase', { locale: 'zh-CN' });

    assert.equal(
      extractDescription(output),
      '创建详细阶段计划（PLAN.md），并完成执行前验证闭环'
    );
    assert.equal(
      extractShortDescription(output),
      '创建阶段计划并完成执行前验证'
    );
    assert.ok(output.includes('argument-hint: "[phase number]"'));
    assert.ok(output.includes('agent: gsd-planner'));
    assert.ok(output.includes('allowed-tools:'));
    assert.ok(output.includes('  - Read'));
    assert.ok(output.includes('  - Bash'));
    assert.ok(output.includes('<objective>'));
    assert.ok(output.includes('Create executable phase prompts (PLAN.md files).'));
  });

  test('unsupported locale falls back cleanly to the English display pair without mutating the body', () => {
    const output = convertClaudeCommandToClaudeSkill(SAMPLE_COMMAND, 'gsd-plan-phase', { locale: 'ko-KR' });

    assert.equal(
      extractDescription(output),
      'Create detailed phase plan (PLAN.md) with verification loop'
    );
    assert.equal(
      extractShortDescription(output),
      'Create detailed phase plan (PLAN.md) with verification loop'
    );
    assert.ok(output.includes('<objective>'));
    assert.ok(output.includes('Create executable phase prompts (PLAN.md files).'));
  });

  test('partial locale data falls back to the English pair instead of producing mixed-language frontmatter', () => {
    const resolver = (namespace, locale, key) => {
      if (namespace !== 'claude-skills') return null;
      if (locale === 'zh-CN' && key.endsWith('.description')) {
        return { value: '仅有中文 description', sourceLocale: 'zh-CN' };
      }
      if (locale === 'en' && key.endsWith('.description')) {
        return { value: 'Create detailed phase plan (PLAN.md) with verification loop', sourceLocale: 'en' };
      }
      if (locale === 'en' && key.endsWith('.short-description')) {
        return { value: 'Create detailed phase plan (PLAN.md) with verification loop', sourceLocale: 'en' };
      }
      return null;
    };

    const output = convertClaudeCommandToClaudeSkill(SAMPLE_COMMAND, 'gsd-plan-phase', {
      locale: 'zh-CN',
      catalogResolver: resolver,
    });

    assert.equal(
      extractDescription(output),
      'Create detailed phase plan (PLAN.md) with verification loop'
    );
    assert.equal(
      extractShortDescription(output),
      'Create detailed phase plan (PLAN.md) with verification loop'
    );
    assert.equal(output.includes('仅有中文 description'), false);
  });

  test('when catalog data is missing entirely, converter falls back to extracted frontmatter description', () => {
    const output = convertClaudeCommandToClaudeSkill(SAMPLE_COMMAND, 'gsd-plan-phase', {
      locale: 'zh-CN',
      catalogResolver: () => null,
    });

    assert.equal(
      extractDescription(output),
      'Create detailed phase plan (PLAN.md) with verification loop'
    );
    assert.equal(
      extractShortDescription(output),
      'Create detailed phase plan (PLAN.md) with verification loop'
    );
  });
});
