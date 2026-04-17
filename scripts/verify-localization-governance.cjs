'use strict';

const { spawnSync } = require('child_process');
const { loadLocaleCatalog } = require('../get-shit-done/bin/lib/locale.cjs');
const {
  collectVerificationEntries,
  ROOT,
  flattenSurfaces,
  loadGovernanceManifest,
  readRepoFile,
  repoPathExists,
} = require('./lib/localization-governance.cjs');

const results = {
  blocker: [],
  warning: [],
  deferred: [],
};

const DRIFT_POLICY_PATH = 'get-shit-done/references/localization-drift-policy.md';

function record(disposition, label, ok, detail) {
  results[disposition].push({ label, ok, detail });
}

function summarizeOutput(output, fallbackDetail) {
  if (!output) {
    return fallbackDetail;
  }

  const lines = output
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return fallbackDetail;
  }

  return lines.slice(-3).join(' | ');
}

function runNodeStep(relativeArgs, fallbackDetail) {
  const runner = process.execPath;
  const execution = spawnSync(runner, relativeArgs, {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env },
  });

  const output = [execution.stdout, execution.stderr].filter(Boolean).join('\n').trim();
  return {
    ok: execution.status === 0,
    detail: summarizeOutput(output, fallbackDetail),
  };
}

function describeSurface(surface, verifierResult) {
  const target = surface.path || surface.path_pattern || surface.id;
  const expected = surface.expected_check || 'verifier executed';
  return `${target} via ${verifierResult.entry} (${surface.group}) | ${verifierResult.detail || expected}`;
}

function runManifestVerifiers() {
  const manifest = loadGovernanceManifest();
  const verificationEntries = collectVerificationEntries(manifest);

  for (const verificationEntry of verificationEntries) {
    const args =
      verificationEntry.runner === 'test'
        ? ['--test', verificationEntry.entry]
        : [verificationEntry.entry];
    const execution = runNodeStep(
      args,
      `${verificationEntry.entry} should pass for all linked governance surfaces`
    );

    for (const surface of verificationEntry.surfaces) {
      record(
        surface.disposition,
        `surface:${surface.id}`,
        execution.ok,
        describeSurface(surface, {
          entry: verificationEntry.entry,
          detail: execution.detail,
        })
      );
    }
  }
}

function verifyManifestPresence() {
  const manifest = loadGovernanceManifest();

  for (const surface of flattenSurfaces(manifest)) {
    if (surface.path) {
      record(
        surface.disposition,
        `manifest:${surface.id}`,
        repoPathExists(surface.path),
        `${surface.path} should exist for ${surface.disposition} governance coverage`
      );
    } else if (surface.path_pattern) {
      record(
        surface.disposition,
        `manifest:${surface.id}`,
        true,
        `${surface.path_pattern} is tracked as a ${surface.disposition} pattern surface`
      );
    }
  }
}

function verifyGovernanceDocsAlignment() {
  const glossary = readRepoFile('get-shit-done/references/localization-glossary.md');
  const playbook = readRepoFile('get-shit-done/references/localization-sync-playbook.md');
  const driftPolicy = readRepoFile(DRIFT_POLICY_PATH);
  const configuration = readRepoFile('docs/CONFIGURATION.md');
  const planningConfig = readRepoFile('get-shit-done/references/planning-config.md');

  record(
    'blocker',
    'docs:localization-governance-contract',
    ['canonical locale', 'English canonical', 'fallback', 'Do Not Translate'].every(token =>
      glossary.includes(token)
    ) &&
      ['trigger', 'owner', 'blocker', 'warning', 'English canonical'].every(token =>
        playbook.includes(token)
      ) &&
      ['blocker', 'warning', 'deferred', 'summary-only locale', 'non-first-batch'].every(token =>
        driftPolicy.includes(token)
      ) &&
      driftPolicy.includes('localization-governance-surfaces.json') &&
      driftPolicy.includes('verify-localization-governance.cjs') &&
      configuration.includes('localization-glossary.md') &&
      configuration.includes('localization-sync-playbook.md') &&
      planningConfig.includes('localization-glossary.md') &&
      planningConfig.includes('localization-sync-playbook.md'),
    'glossary, playbook, drift policy, public config docs, and maintainer config docs must stay linked by the same governance wording'
  );
}

function verifyFeatureDocsAlignment() {
  const features = readRepoFile('docs/FEATURES.md');

  record(
    'blocker',
    'docs:features-localization-governance',
    ['response_language', 'verify-localization-governance.cjs', 'first-batch', 'summary-only locale', 'English canonical'].every(
      token => features.includes(token)
    ),
    'feature docs must describe the localization governance command and the first-batch versus summary-only boundary'
  );
}

function verifyBlockerSummarySurface() {
  const zhCommands = readRepoFile('docs/zh-CN/COMMANDS.md');
  const ok = [
    '/gsd-progress',
    '/gsd-discuss-phase',
    '/gsd-plan-phase',
    '/gsd-execute-phase',
    '/gsd-next',
    '../COMMANDS.md',
  ].every(token => zhCommands.includes(token));

  record(
    'blocker',
    'summary:docs/zh-CN/COMMANDS.md',
    ok,
    'zh-CN summary must cover the first-batch commands and keep English canonical links visible'
  );
}

function verifyWarningSummarySurfaces() {
  const manifest = loadGovernanceManifest();
  const warningSurfaces = flattenSurfaces(manifest).filter(
    surface => surface.group === 'command-summary-warning-locales' && surface.path
  );

  for (const surface of warningSurfaces) {
    const relativePath = surface.path;
    const content = readRepoFile(relativePath);
    const ok =
      content.includes('../COMMANDS.md') &&
      content.includes('English canonical') &&
      /summary|要約|resumo/i.test(content) &&
      /mirror|fallback/i.test(content);

    record(
      'warning',
      `surface:${surface.id}`,
      ok,
      `${relativePath} should remain summary-only with explicit English canonical fallback or mirror disclosure`
    );
  }
}

function verifyBlockerAssetParity() {
  const enAssets = JSON.parse(readRepoFile('get-shit-done/locales/en/assets.json'));
  const zhAssets = JSON.parse(readRepoFile('get-shit-done/locales/zh-CN/assets.json'));
  const ok = JSON.stringify(Object.keys(enAssets).sort()) === JSON.stringify(Object.keys(zhAssets).sort());

  record(
    'blocker',
    'catalog:get-shit-done/locales/{en,zh-CN}/assets.json',
    ok,
    'first-batch assets catalogs must keep identical key sets'
  );

  const ptAssets = loadLocaleCatalog('assets', 'pt-BR');
  record(
    'warning',
    'catalog:get-shit-done/locales/pt-BR/assets.json',
    ptAssets['assets.summary.performance'] === 'Performance',
    'non-first-batch assets coverage currently falls back to English and stays warning-only'
  );
}

function addDeferredNotes() {
  const manifest = loadGovernanceManifest();
  for (const surface of flattenSurfaces(manifest).filter(surface => surface.disposition === 'deferred')) {
    record(
      'deferred',
      `deferred:${surface.id}`,
      true,
      `${surface.path_pattern || surface.path} remains outside the first-batch hard gate`
    );
  }
}

function printSection(title, entries) {
  console.log(`## ${title}`);
  if (entries.length === 0) {
    console.log('- none');
    console.log('');
    return;
  }

  for (const entry of entries) {
    console.log(`- [${entry.ok ? 'PASS' : 'FAIL'}] ${entry.label}`);
    console.log(`  ${entry.detail}`);
  }
  console.log('');
}

verifyManifestPresence();
verifyGovernanceDocsAlignment();
verifyFeatureDocsAlignment();
runManifestVerifiers();
verifyBlockerSummarySurface();
verifyWarningSummarySurfaces();
verifyBlockerAssetParity();
addDeferredNotes();

const blockerFailures = results.blocker.filter(entry => !entry.ok).length;
const warningFailures = results.warning.filter(entry => !entry.ok).length;

console.log('Localization Governance Verification');
console.log(`Root: ${ROOT}`);
console.log('');

printSection('Blocker', results.blocker);
printSection('Warning', results.warning);
printSection('Deferred', results.deferred);

console.log(
  `Summary: blocker_failures=${blockerFailures}, warning_failures=${warningFailures}, deferred=${results.deferred.length}`
);

if (blockerFailures > 0) {
  process.exit(1);
}
