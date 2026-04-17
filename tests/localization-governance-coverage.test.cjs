'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const {
  ROOT,
  collectVerificationEntries,
  flattenSurfaces,
  getSurfaceGroup,
  loadGovernanceManifest,
} = require('../scripts/lib/localization-governance.cjs');

const VERIFIER_PATH = path.join(ROOT, 'scripts', 'verify-localization-governance.cjs');
const CONFIG_DOC_PATH = path.join(ROOT, 'docs', 'CONFIGURATION.md');
const FEATURES_DOC_PATH = path.join(ROOT, 'docs', 'FEATURES.md');
const PLANNING_CONFIG_DOC_PATH = path.join(ROOT, 'get-shit-done', 'references', 'planning-config.md');
const CODE_REVIEW_WORKFLOW_PATH = path.join(ROOT, 'get-shit-done', 'workflows', 'code-review.md');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function runVerifier(options = {}) {
  const env = { ...process.env };
  if (options.root) {
    env.GSD_LOCALIZATION_GOVERNANCE_ROOT = options.root;
  }
  if (options.manifestPath) {
    env.GSD_LOCALIZATION_GOVERNANCE_MANIFEST = options.manifestPath;
  }

  const result = spawnSync(process.execPath, [VERIFIER_PATH], {
    cwd: ROOT,
    encoding: 'utf8',
    env,
    timeout: 20000,
  });

  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

function writeFile(targetPath, content) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content);
}

function createManifestOnlyFixture(t, options = {}) {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'gsd-l10n-governance-'));
  t.after(() => fs.rmSync(tmpRoot, { recursive: true, force: true }));

  const blockerEntry = path.join(tmpRoot, 'blocker-check.cjs');
  const warningEntry = path.join(tmpRoot, 'warning-check.cjs');

  writeFile(
    blockerEntry,
    options.blockerPass === false
      ? "'use strict';\nconsole.error('fixture blocker failed');\nprocess.exit(1);\n"
      : "'use strict';\nconsole.log('fixture blocker passed');\n"
  );
  writeFile(
    warningEntry,
    options.warningPass === false
      ? "'use strict';\nconsole.error('fixture warning failed');\nprocess.exit(1);\n"
      : "'use strict';\nconsole.log('fixture warning passed');\n"
  );

  const manifestPath = path.join(tmpRoot, 'fixture-manifest.json');
  const manifest = {
    surface_groups: [
      {
        group: 'fixture-blockers',
        disposition: 'blocker',
        owner_hint: 'tests',
        surfaces: [
          {
            id: 'fixture-blocker',
            path: 'docs/CONFIGURATION.md',
            expected_check: 'fixture blocker should drive exit code',
            verification_entry: blockerEntry,
          },
        ],
      },
      {
        group: 'fixture-warnings',
        disposition: 'warning',
        owner_hint: 'tests',
        surfaces: [
          {
            id: 'fixture-warning',
            path: 'docs/ja-JP/COMMANDS.md',
            expected_check: 'fixture warning should stay visible without blocking',
            verification_entry: warningEntry,
          },
        ],
      },
      {
        group: 'fixture-deferred',
        disposition: 'deferred',
        owner_hint: 'tests',
        surfaces: [
          {
            id: 'fixture-deferred',
            path_pattern: 'docs/{locale}/README.md',
            verification_entry: 'report-only',
          },
        ],
      },
    ],
  };
  writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  return { manifestPath };
}

function createRootFixture(t, warningSummaryContent) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'gsd-l10n-root-'));
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));

  writeFile(
    path.join(fixtureRoot, 'docs', 'CONFIGURATION.md'),
    [
      '# CONFIGURATION',
      'BCP 47',
      '"en"',
      '"zh-CN"',
      'alias compatibility',
      'zh-CN -> en',
      'English canonical',
      'commands paths code snippets',
      'localization-glossary.md',
      'localization-sync-playbook.md',
    ].join('\n')
  );
  writeFile(
    path.join(fixtureRoot, 'docs', 'FEATURES.md'),
    'response_language\nverify-localization-governance.cjs\nfirst-batch\nsummary-only locale\nEnglish canonical\n'
  );
  writeFile(
    path.join(fixtureRoot, 'docs', 'zh-CN', 'COMMANDS.md'),
    [
      '/gsd-progress',
      '/gsd-discuss-phase',
      '/gsd-plan-phase',
      '/gsd-execute-phase',
      '/gsd-next',
      '../COMMANDS.md',
    ].join('\n')
  );
  writeFile(path.join(fixtureRoot, 'docs', 'ja-JP', 'COMMANDS.md'), warningSummaryContent);
  writeFile(
    path.join(fixtureRoot, 'get-shit-done', 'references', 'localization-glossary.md'),
    'canonical locale\nEnglish canonical\nfallback\nDo Not Translate\n'
  );
  writeFile(
    path.join(fixtureRoot, 'get-shit-done', 'references', 'localization-sync-playbook.md'),
    'trigger\nowner\nblocker\nwarning\nEnglish canonical\n'
  );
  writeFile(
    path.join(fixtureRoot, 'get-shit-done', 'references', 'localization-drift-policy.md'),
    'blocker\nwarning\ndeferred\nsummary-only locale\nnon-first-batch\nlocalization-governance-surfaces.json\nverify-localization-governance.cjs\n'
  );
  writeFile(
    path.join(fixtureRoot, 'get-shit-done', 'references', 'planning-config.md'),
    'localization-glossary.md\nlocalization-sync-playbook.md\nEnglish canonical\nfallback\nresponse_language\n'
  );
  writeFile(
    path.join(fixtureRoot, 'get-shit-done', 'locales', 'en', 'assets.json'),
    JSON.stringify(
      {
        'assets.summary.performance': 'Performance',
        'assets.validation.title': 'Validation Strategy',
      },
      null,
      2
    )
  );
  writeFile(
    path.join(fixtureRoot, 'get-shit-done', 'locales', 'zh-CN', 'assets.json'),
    JSON.stringify(
      {
        'assets.summary.performance': '性能',
        'assets.validation.title': '验证策略',
      },
      null,
      2
    )
  );

  const passingEntry = path.join(fixtureRoot, 'warning-disclosure-pass.test.cjs');
  writeFile(
    passingEntry,
    "'use strict';\nconst { test } = require('node:test');\ntest('fixture warning verifier passes', () => {});\n"
  );

  const manifest = {
    surface_groups: [
      {
        group: 'fixture-blockers',
        disposition: 'blocker',
        owner_hint: 'tests',
        surfaces: [
          {
            id: 'fixture-blocker',
            path: 'docs/CONFIGURATION.md',
            expected_check: 'fixture blocker stays green',
            verification_entry: passingEntry,
          },
        ],
      },
      {
        group: 'command-summary-warning-locales',
        disposition: 'warning',
        owner_hint: 'tests',
        surfaces: [
          {
            id: 'fixture-warning-disclosure',
            path: 'docs/ja-JP/COMMANDS.md',
            expected_check: 'warning summaries must disclose mirror or fallback limits',
            verification_entry: passingEntry,
          },
        ],
      },
    ],
  };
  const manifestPath = path.join(fixtureRoot, 'get-shit-done', 'references', 'localization-governance-surfaces.json');
  writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  return { fixtureRoot, manifestPath };
}

describe('localization governance manifest coverage', () => {
  test('drift policy defines blocker, warning, and deferred handling for English canonical changes', () => {
    const driftPolicy = read(path.join(ROOT, 'get-shit-done', 'references', 'localization-drift-policy.md'));

    for (const token of [
      'blocker',
      'warning',
      'deferred',
      'English canonical',
      'first-batch',
      'non-first-batch',
      'summary-only locale',
      'verify-localization-governance.cjs',
      'localization-governance-surfaces.json',
    ]) {
      assert.match(driftPolicy, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  });

  test('manifest defines blocker, warning, and deferred surfaces', () => {
    const manifest = loadGovernanceManifest();
    const dispositions = manifest.surface_groups.map(group => group.disposition);

    assert.ok(dispositions.includes('blocker'));
    assert.ok(dispositions.includes('warning'));
    assert.ok(dispositions.includes('deferred'));
  });

  test('manifest verification entries are deduped and preserve linked surfaces', () => {
    const entries = collectVerificationEntries(loadGovernanceManifest());

    assert.ok(entries.length >= 5, 'expected manifest-backed verification entries');
    assert.equal(entries.length, new Set(entries.map(entry => entry.entry)).size);
    assert.ok(entries.every(entry => Array.isArray(entry.surfaces) && entry.surfaces.length > 0));
    assert.ok(entries.some(entry => entry.entry.endsWith('tests/command-summary-localization.test.cjs')));
    assert.ok(
      entries.some(entry =>
        entry.surfaces.some(surface => surface.id === 'command-summary-zh-CN')
      )
    );
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
});

describe('localization governance verifier behavior', () => {
  test('baseline verifier prints blocker, warning, and deferred sections and exits 0', () => {
    const result = runVerifier();

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /## Blocker/);
    assert.match(result.stdout, /## Warning/);
    assert.match(result.stdout, /## Deferred/);
    assert.match(result.stdout, /Summary: blocker_failures=0, warning_failures=0, deferred=\d+/);
  });

  test('blocker verifier failure returns non-zero and reports the linked surface', t => {
    const { manifestPath } = createManifestOnlyFixture(t, { blockerPass: false, warningPass: true });
    const result = runVerifier({ manifestPath });

    assert.notEqual(result.status, 0, 'blocker failure should return non-zero');
    assert.match(result.stdout, /surface:fixture-blocker/);
    assert.match(result.stdout, /FAIL/);
  });

  test('warning-only verifier failure stays visible without blocking the command', t => {
    const { manifestPath } = createManifestOnlyFixture(t, { blockerPass: true, warningPass: false });
    const result = runVerifier({ manifestPath });

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /## Warning/);
    assert.match(result.stdout, /surface:fixture-warning/);
    assert.match(result.stdout, /FAIL/);
  });

  test('warning summary contract fails when fallback or mirror disclosure disappears', t => {
    const { fixtureRoot, manifestPath } = createRootFixture(
      t,
      '../COMMANDS.md\nEnglish canonical\nsummary only\n'
    );
    const result = runVerifier({ root: fixtureRoot, manifestPath });

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /## Warning/);
    assert.match(result.stdout, /surface:fixture-warning-disclosure/);
    assert.match(result.stdout, /fallback or mirror disclosure/);
    assert.match(result.stdout, /FAIL/);
  });
});

describe('localization governance documentation alignment', () => {
  test('glossary, playbook, config docs, and feature docs reuse the same governance wording', () => {
    const features = read(FEATURES_DOC_PATH);
    const configuration = read(CONFIG_DOC_PATH);
    const planningConfig = read(PLANNING_CONFIG_DOC_PATH);

    for (const token of ['response_language', 'canonical locale', 'English canonical', 'fallback']) {
      assert.match(features, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      assert.match(configuration, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      assert.match(planningConfig, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  });

  test('workflow.code_review_depth allowed values stay aligned across maintainer docs, public docs, and workflow truth', () => {
    const planningConfig = read(PLANNING_CONFIG_DOC_PATH);
    const configuration = read(CONFIG_DOC_PATH);
    const codeReviewWorkflow = read(CODE_REVIEW_WORKFLOW_PATH);

    assert.match(planningConfig, /"quick", "standard", "deep"/);
    assert.match(configuration, /`quick`[\s\S]*`standard`[\s\S]*`deep`/);
    assert.match(codeReviewWorkflow, /quick\|standard\|deep/);
  });
});
