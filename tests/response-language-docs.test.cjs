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
const USER_GUIDE_DOC = path.join(ROOT, 'docs', 'USER-GUIDE.md');
const FEATURES_DOC = path.join(ROOT, 'docs', 'FEATURES.md');
const FIRST_BATCH = [
  'gsd-new-milestone',
  'gsd-progress',
  'gsd-discuss-phase',
  'gsd-plan-phase',
  'gsd-execute-phase',
  'gsd-next',
];

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

  test('both docs describe the separate installer and Codex install-output chains plus localized field boundaries', () => {
    for (const filePath of [CONFIG_DOC, PLANNING_CONFIG_DOC]) {
      const content = read(filePath);
      assert.ok(content.includes('installer'), `${path.basename(filePath)} should mention installer catalog`);
      assert.ok(content.includes('codex-skills'), `${path.basename(filePath)} should mention codex-skills`);
      assert.match(content, /three separate localization chains|three separate localization chain|separate localization chains|separate localization chain/i, `${path.basename(filePath)} should describe separate localization chains`);
      assert.match(content, /help text|progress lines|completion messages/i, `${path.basename(filePath)} should mention installer-facing localized copy`);
      assert.ok(content.includes('description'), `${path.basename(filePath)} should mention description localization`);
      assert.ok(content.includes('metadata.short-description'), `${path.basename(filePath)} should mention short-description localization`);
      assert.match(content, /skill bod(y|ies)|adapter/i, `${path.basename(filePath)} should mention English retention for body or adapter content`);
    }
  });

  test('both docs lock the official six-skill Codex first-batch contract and defer wider scope', () => {
    for (const filePath of [CONFIG_DOC, PLANNING_CONFIG_DOC]) {
      const content = read(filePath);

      assert.match(content, /official v1\.1 Codex install-display contract/i, `${path.basename(filePath)} should describe the official Codex contract`);
      assert.match(content, /six skills/i, `${path.basename(filePath)} should describe the six-skill boundary`);
      assert.match(content, /deferred roadmap work/i, `${path.basename(filePath)} should state that wider scope stays deferred`);

      for (const skill of FIRST_BATCH) {
        assert.ok(content.includes(skill), `${path.basename(filePath)} should list ${skill}`);
      }
    }
  });

  test('user guide and features keep lightweight installer and Codex locale guidance', () => {
    const userGuide = read(USER_GUIDE_DOC);
    const features = read(FEATURES_DOC);

    assert.match(userGuide, /installer/i);
    assert.match(userGuide, /Codex/i);
    assert.match(userGuide, /help text|progress lines|completion messages/i);
    assert.match(userGuide, /installer/i);
    assert.match(userGuide, /codex-skills/i);
    assert.match(userGuide, /metadata\.short-description/i);
    assert.match(userGuide, /CONFIGURATION\.md#response_language-contract/);

    assert.match(features, /Installer CLI output/i);
    assert.match(features, /installer/i);
    assert.match(features, /Codex install output/i);
    assert.match(features, /codex-skills/i);
    assert.match(features, /metadata\.short-description/i);
    assert.match(features, /English canonical/i);
    assert.match(features, /six skills/i);
    assert.match(features, /deferred roadmap work/i);

    for (const skill of FIRST_BATCH) {
      assert.ok(features.includes(skill), `FEATURES.md should list ${skill}`);
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
