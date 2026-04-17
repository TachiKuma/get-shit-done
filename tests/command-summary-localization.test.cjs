'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  getSurfaceGroup,
  loadGovernanceManifest,
} = require('../scripts/lib/localization-governance.cjs');

const ROOT = path.join(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

describe('command summary localization contract', () => {
  test('zh-CN command summary covers the first-batch workflow commands', () => {
    const content = read('docs/zh-CN/COMMANDS.md');
    for (const command of ['/gsd-progress', '/gsd-discuss-phase', '/gsd-plan-phase', '/gsd-execute-phase', '/gsd-next']) {
      assert.ok(content.includes(command), `zh-CN COMMANDS should include ${command}`);
    }
    assert.ok(content.includes('../COMMANDS.md'), 'zh-CN COMMANDS should link to English canonical docs');
    assert.match(content, /摘要层|mirror/i, 'zh-CN COMMANDS should disclose summary-layer positioning');
  });

  test('zh-CN docs index points to localized command summary coverage', () => {
    const content = read('docs/zh-CN/README.md');
    assert.ok(content.includes('[命令摘要](COMMANDS.md)'), 'zh-CN README should link to localized command summary');
    assert.ok(!content.includes('[命令参考](../COMMANDS.md) | 回退英文'), 'zh-CN README should not claim English-only fallback');
  });

  test('governance manifest classifies zh-CN as blocker and non-first-batch summaries as warning', () => {
    const manifest = loadGovernanceManifest();
    const blockerGroup = getSurfaceGroup(manifest, 'command-summary-first-batch');

    assert.ok(blockerGroup, 'command-summary-first-batch group should exist');
    assert.equal(blockerGroup.disposition, 'blocker');
    assert.ok(blockerGroup.surfaces.some(surface => surface.path === 'docs/zh-CN/COMMANDS.md'));
    assert.ok(
      blockerGroup.surfaces.every(
        surface => surface.verification_entry === 'tests/command-summary-localization.test.cjs'
      ),
      'blocker summary surfaces should use the blocker-only verifier entry'
    );
  });
});
