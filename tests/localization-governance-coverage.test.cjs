'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const {
  ROOT,
  flattenSurfaces,
  getSurfaceGroup,
  loadGovernanceManifest,
} = require('../scripts/lib/localization-governance.cjs');

describe('localization governance manifest coverage', () => {
  test('manifest defines blocker, warning, and deferred surfaces', () => {
    const manifest = loadGovernanceManifest();
    const dispositions = manifest.surface_groups.map(group => group.disposition);

    assert.ok(dispositions.includes('blocker'));
    assert.ok(dispositions.includes('warning'));
    assert.ok(dispositions.includes('deferred'));
  });

  test('blocker surfaces include priority workflows, config docs, catalogs, and zh-CN command summary', () => {
    const manifest = loadGovernanceManifest();
    const blockerPaths = flattenSurfaces(manifest)
      .filter(surface => surface.disposition === 'blocker')
      .map(surface => surface.path);

    for (const expectedPath of [
      'get-shit-done/workflows/discuss-phase.md',
      'get-shit-done/workflows/plan-phase.md',
      'get-shit-done/workflows/execute-phase.md',
      'get-shit-done/workflows/progress.md',
      'docs/CONFIGURATION.md',
      'get-shit-done/references/planning-config.md',
      'get-shit-done/locales/en/runtime.json',
      'get-shit-done/locales/zh-CN/runtime.json',
      'get-shit-done/locales/en/assets.json',
      'get-shit-done/locales/zh-CN/assets.json',
      'docs/zh-CN/COMMANDS.md',
    ]) {
      assert.ok(blockerPaths.includes(expectedPath), `missing blocker surface ${expectedPath}`);
    }
  });

  test('warning-only command summary locales stay outside the blocker set', () => {
    const manifest = loadGovernanceManifest();
    const warningGroup = getSurfaceGroup(manifest, 'command-summary-warning-locales');

    assert.ok(warningGroup, 'warning group should exist');
    assert.equal(warningGroup.disposition, 'warning');

    const warningPaths = warningGroup.surfaces.map(surface => surface.path);
    assert.deepStrictEqual(warningPaths.sort(), [
      'docs/ja-JP/COMMANDS.md',
      'docs/ko-KR/COMMANDS.md',
      'docs/pt-BR/COMMANDS.md',
    ]);
  });

  test('deferred group keeps broader workflow and docs surfaces out of the first-batch hard gate', () => {
    const manifest = loadGovernanceManifest();
    const deferredGroup = getSurfaceGroup(manifest, 'deferred-surfaces');

    assert.ok(deferredGroup, 'deferred group should exist');
    assert.equal(deferredGroup.disposition, 'deferred');
    assert.ok(
      deferredGroup.surfaces.some(surface => surface.path_pattern === 'get-shit-done/workflows/*.md')
    );
    assert.ok(
      deferredGroup.surfaces.some(surface => surface.path_pattern === 'docs/{locale}/README.md')
    );
  });

  test('glossary, playbook, and config docs reuse the same governance wording', () => {
    const glossary = fs.readFileSync(
      path.join(ROOT, 'get-shit-done', 'references', 'localization-glossary.md'),
      'utf8'
    );
    const playbook = fs.readFileSync(
      path.join(ROOT, 'get-shit-done', 'references', 'localization-sync-playbook.md'),
      'utf8'
    );
    const configuration = fs.readFileSync(path.join(ROOT, 'docs', 'CONFIGURATION.md'), 'utf8');
    const planningConfig = fs.readFileSync(
      path.join(ROOT, 'get-shit-done', 'references', 'planning-config.md'),
      'utf8'
    );

    for (const token of ['canonical locale', 'English canonical', 'fallback', 'response_language']) {
      assert.match(glossary, new RegExp(token.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')));
      assert.match(playbook, new RegExp(token.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')));
      assert.match(configuration, new RegExp(token.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')));
      assert.match(planningConfig, new RegExp(token.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')));
    }

    assert.match(playbook, /localization-governance-surfaces\.json/);
    assert.match(configuration, /localization-glossary\.md/);
    assert.match(configuration, /localization-sync-playbook\.md/);
    assert.match(planningConfig, /localization-glossary\.md/);
    assert.match(planningConfig, /localization-sync-playbook\.md/);
  });
});
