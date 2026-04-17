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

describe('command summary warning locale contract', () => {
  test('non-first-batch locales keep explicit fallback or mirror disclosure', () => {
    for (const relativePath of ['docs/ja-JP/COMMANDS.md', 'docs/ko-KR/COMMANDS.md', 'docs/pt-BR/COMMANDS.md']) {
      const content = read(relativePath);
      assert.ok(content.includes('../COMMANDS.md'), `${relativePath} should link to English canonical docs`);
      assert.ok(content.includes('English canonical'), `${relativePath} should disclose English canonical fallback`);
      assert.match(content, /summary|要約|resumo/i, `${relativePath} should disclose summary-only coverage`);
      assert.match(content, /mirror|fallback/i, `${relativePath} should explain the limited scope`);
    }
  });

  test('governance manifest keeps non-first-batch summaries on a warning-only verifier entry', () => {
    const manifest = loadGovernanceManifest();
    const warningGroup = getSurfaceGroup(manifest, 'command-summary-warning-locales');

    assert.ok(warningGroup, 'command-summary-warning-locales group should exist');
    assert.equal(warningGroup.disposition, 'warning');

    for (const expectedPath of ['docs/ja-JP/COMMANDS.md', 'docs/ko-KR/COMMANDS.md', 'docs/pt-BR/COMMANDS.md']) {
      assert.ok(
        warningGroup.surfaces.some(surface => surface.path === expectedPath),
        `${expectedPath} should stay warning-only`
      );
    }

    assert.ok(
      warningGroup.surfaces.every(
        surface => surface.verification_entry === 'tests/command-summary-warning-locales.test.cjs'
      ),
      'warning summary surfaces should use the warning-only verifier entry'
    );
  });
});
