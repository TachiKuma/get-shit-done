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
const CONFIG_DOC = path.join(ROOT, 'docs', 'CONFIGURATION.md');
const PLANNING_CONFIG_DOC = path.join(ROOT, 'get-shit-done', 'references', 'planning-config.md');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

describe('response_language documentation contract', () => {
  test('both docs recommend canonical locale examples', () => {
    for (const filePath of [CONFIG_DOC, PLANNING_CONFIG_DOC]) {
      const content = read(filePath);
      assert.ok(content.includes('BCP 47'), `${path.basename(filePath)} should mention BCP 47`);
      assert.ok(content.includes('"en"'), `${path.basename(filePath)} should include en example`);
      assert.ok(content.includes('"zh-CN"'), `${path.basename(filePath)} should include zh-CN example`);
    }
  });

  test('both docs describe alias compatibility and fallback', () => {
    for (const filePath of [CONFIG_DOC, PLANNING_CONFIG_DOC]) {
      const content = read(filePath);
      assert.ok(/alias/i.test(content), `${path.basename(filePath)} should mention alias compatibility`);
      assert.ok(content.includes('zh-CN -> en'), `${path.basename(filePath)} should mention zh-CN -> en fallback`);
    }
  });

  test('both docs describe English retention for technical identifiers', () => {
    for (const filePath of [CONFIG_DOC, PLANNING_CONFIG_DOC]) {
      const content = read(filePath);
      assert.ok(content.includes('English'), `${path.basename(filePath)} should mention English retention`);
      assert.ok(/commands|paths|code snippets/i.test(content), `${path.basename(filePath)} should mention technical identifiers`);
    }
  });

  test('governance manifest keeps both docs in the blocker contract', () => {
    const manifest = loadGovernanceManifest();
    const docGroup = getSurfaceGroup(manifest, 'config-and-public-contract');

    assert.ok(docGroup, 'config-and-public-contract group should exist');
    assert.equal(docGroup.disposition, 'blocker');

    for (const expectedPath of ['docs/CONFIGURATION.md', 'get-shit-done/references/planning-config.md']) {
      assert.ok(
        docGroup.surfaces.some(surface => surface.path === expectedPath),
        `${expectedPath} should be tracked by the governance manifest`
      );
    }
  });
});
